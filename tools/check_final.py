import json, subprocess, time

def check_rdap_full(domain, base):
    url = base + domain
    try:
        out = subprocess.run(['curl', '-s', '-m', '12', url], capture_output=True, text=True, timeout=20).stdout
        d = json.loads(out)
        if d.get('errorCode') == 404:
            desc = ' '.join(d.get('description', []))
            if 'available for registration' in desc:
                return 'BUCHBAR', desc
            elif 'restricted' in desc.lower() or 'not available' in desc.lower():
                return 'GESPERRT', desc
            else:
                return '404?', desc
        else:
            return 'VERGEBEN', f'status {d.get("errorCode")}'
    except Exception as e:
        return 'ERR', str(e)

# .in weitere Wortspiel-Kandidaten — nur "available for registration" zählt
in_candidates = [
    'benchma.in',      # BENCHMARK - Benchmark!
    'chai.in',         # chain
    'certai.in',       # certain (bekannt buchbar)
    'detai.in',        # detail (bekannt buchbar)
    'contai.in',       # contain
    'pla.in',          # plain
    'trai.in',         # train
    'agai.in',         # again
    'bega.in',         # begin
    'withi.in',        # within
    'enterpris.in',    # enterprise (bekannt buchbar)
    'filli.in',        # fill in
    'logi.in',         # login
    'a.in',            # a.in
    'ch.in',           # ch.in
    'capita.in',       # captain
    'obta.in',         # obtain
    'susta.in',        # sustain
    'reta.in',         # retain
    'uncerta.in',      # uncertain
    'margi.in',        # margin
    'explai.in',       # explain
    'pla.in',          # plain
    'cha.in',          # chain (short)
    'bra.in',          # brain
    'doma.in',         # domain
    'huma.in',         # human
    'villa.in',        # villain
    'manti.in',        # manti (bekannt buchbar)
    'bargai.in',       # bargain - Schnäppchen!
    'aga.in',          # again short
]

# .click Kandidaten
click_candidates = [
    'bench.click',
    'win.click',
    'rank.click',
    'compareit.click',
    'pick.click',
    'best.click',
    'cli.click',
    'code.click',
]

results = []
print("=== .in ===")
for d in in_candidates:
    status, desc = check_rdap_full(d, 'https://rdap.nixiregistry.in/rdap/domain/')
    results.append((d, status, desc))
    mark = 'OK ' if status == 'BUCHBAR' else ('XX ' if status == 'GESPERRT' else '?? ')
    print(f'{mark} {d:18s} {status:10s} {desc[:70]}')
    time.sleep(0.8)

print()
print("=== .click ===")
for d in click_candidates:
    status, desc = check_rdap_full(d, 'https://rdap.registry.click/rdap/domain/')
    results.append((d, status, desc))
    mark = 'OK ' if status == 'BUCHBAR' else ('XX ' if status == 'GESPERRT' else '?? ')
    print(f'{mark} {d:18s} {status:10s} {desc[:70]}')
    time.sleep(0.8)

print()
print("=== NUR VERIFIZIERT BUCHBAR ===")
for d, s, desc in results:
    if s == 'BUCHBAR':
        print(f'  {d:18s} {desc[:80]}')