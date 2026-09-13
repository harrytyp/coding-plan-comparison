import subprocess, time

domains = ['benchma.in', 'certai.in', 'detai.in', 'enterpris.in', 'withi.in', 'manti.in',
           'bench.click', 'rank.click', 'compareit.click']

for d in domains:
    print(f'=== {d} ===')
    try:
        result = subprocess.run(
            ['curl', '-s', '-m', '30',
             f'https://r.jina.ai/https://sedo.com/search/details/?partnerid=323968&language=us&domain={d}&origin=partner'],
            capture_output=True, text=True, timeout=35).stdout
        price_lines = [l for l in result.split('\n') if any(k in l.lower() for k in
                       ['seller\'s asking price', 'asking price', 'fixed price', 'buy now', 'price:'])]
        if price_lines:
            for l in price_lines[:2]:
                print(f'  SEDO-LISTUNG: {l.strip()}')
        else:
            # Show a snippet to understand what the page says
            lines = [l.strip() for l in result.split('\n') if l.strip()]
            snippet = [l for l in lines if any(w in l.lower() for w in ['domain', 'available', 'not', 'register', 'offer'])]
            if snippet:
                for l in snippet[:4]:
                    print(f'  INFO: {l[:120]}')
            else:
                print(f'  (keine Preis-Info im Text, {len(lines)} Zeilen)')
    except Exception as e:
        print(f'  ERR: {e}')
    time.sleep(3)
