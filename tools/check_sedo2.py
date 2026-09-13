import subprocess, time

# Sedo asking-price check for ALL domains I recommended + variants
domains = [
    # Was ich als "BUCHBAR" empfohlen hatte
    'benchma.in', 'certai.in', 'detai.in', 'enterpris.in', 'withi.in', 'manti.in', 'bargai.in',
    # Was der User fand
    'barga.in',
    # click-Kandidaten
    'bench.click', 'rank.click', 'compareit.click',
]

for d in domains:
    try:
        result = subprocess.run(
            ['curl', '-s', '-m', '30',
             f'https://r.jina.ai/https://sedo.com/search/details/?partnerid=323968&language=us&domain={d}&origin=partner'],
            capture_output=True, text=True, timeout=35).stdout
        lines = [l.strip() for l in result.split('\n') if l.strip()]
        # Looking for price info
        price = None
        for l in lines:
            low = l.lower()
            if 'asking price' in low or 'fixed price' in low or 'buy now' in low:
                price = l
                break
        # Fallback: scan for dollar/euro amounts near 'price'
        if not price:
            for i, l in enumerate(lines):
                if 'price' in l.lower():
                    for j in range(max(0, i - 1), min(len(lines), i + 3)):
                        if any(c in lines[j] for c in ['$', '€', 'EUR', 'USD']):
                            price = lines[j]
                            break
                    if price:
                        break
        if price:
            print(f'{d:16s} -> PREIS: {price}')
        else:
            # Distinguish: marketplace listing vs generic page
            has_market = any('domain owner' in l.lower() or 'make offer' in l.lower() or 'seller' in l.lower() for l in lines)
            if has_market:
                print(f'{d:16s} -> im Aftermarket gelistet (kein Listenpreis sichtbar)')
            else:
                print(f'{d:16s} -> KEINE Aftermarket-Listung gefunden (evtl. wirklich frei)')
    except Exception as e:
        print(f'{d:16s} -> ERR {e}')
    time.sleep(2)
