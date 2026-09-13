import subprocess, json, time

# Try whois-free RDAP + a real registrar availability API.
# Many registrars expose search via their public pages; let's try a few known JSON endpoints.

def try_url(name, url, headers=None):
    cmd = ['curl', '-s', '-m', '20', url]
    for k, v in (headers or {}).items():
        cmd += ['-H', f'{k}: {v}']
    try:
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=25).stdout
        return out[:600]
    except Exception as e:
        return f'ERR {e}'

print("=== 1. whoisxmlapi free demo? ===")
print("skip (needs key)")

print("\n=== 2. GoDaddy availability (needs key) ===")
print("skip (needs key)")

print("\n=== 3. Namecheap XML API free? ===")
# namecheap api needs key
print("skip")

print("\n=== 4. Porkbun via jina (renders JS prices) ===")
for d in ['withi.in', 'manti.in']:
    out = try_url(f'porkbun-{d}', f'https://r.jina.ai/https://porkbun.com/checkout/search?q={d}',
                  {'User-Agent': 'Mozilla/5.0'})
    # grep-ish: show lines with domain name + price
    lines = [l.strip() for l in out.split('\n') if l.strip()]
    hits = [l for l in lines if any(w in l.lower() for w in ['withi', 'manti', 'usd', 'eur', '€', '$', 'available', 'cart'])]
    print(f'--- {d} ---')
    for h in hits[:10]:
        print(f'  {h[:150]}')
    time.sleep(2)
