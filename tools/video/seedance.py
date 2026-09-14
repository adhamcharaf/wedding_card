"""Soumet une tâche Seedance 2.5 (BytePlus ModelArk) et télécharge la vidéo.

Usage : ARK_API_KEY=... python3 tools/video/seedance.py assets/seedance/video2.json sortie.mp4
Le JSON décrit le prompt, les images (rôle first_frame / last_frame / reference_image,
chemins relatifs au JSON), la résolution, le ratio, la durée, la graine.
La clé ne vit que dans l'environnement (.env local, jamais dans le dépôt).
Une tâche refusée par le filtre de sortie (OutputVideoSensitiveContentDetected)
n'est pas facturée ; une tâche en cours ne peut pas être annulée.
"""
import base64, json, os, sys, time, urllib.request, mimetypes

BASE = 'https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks'
MODEL = 'dreamina-seedance-2-5-260628'
KEY = os.environ['ARK_API_KEY']

def data_url(path):
    mime = mimetypes.guess_type(path)[0] or 'image/png'
    with open(path, 'rb') as f:
        return f'data:{mime};base64,' + base64.b64encode(f.read()).decode()

def api(method, url, body=None):
    req = urllib.request.Request(url, method=method, headers={'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'},
                                 data=json.dumps(body).encode() if body else None)
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise SystemExit(f'HTTP {e.code}: {e.read().decode()[:1500]}')

def generer(spec, sortie):
    content = [{'type': 'text', 'text': spec['prompt']}]
    for role, path in spec.get('images', []):
        item = {'type': 'image_url', 'image_url': {'url': data_url(path)}}
        if role: item['role'] = role
        content.append(item)
    body = {'model': MODEL, 'content': content, 'generate_audio': spec.get('audio', False), 'watermark': False,
            'resolution': spec.get('resolution', '480p'), 'duration': spec.get('duration', 4)}
    if spec.get('ratio'): body['ratio'] = spec['ratio']
    if spec.get('seed') is not None: body['seed'] = spec['seed']
    t0 = time.time()
    res = api('POST', BASE, body)
    tid = res['id']
    print('tache', tid, flush=True)
    while True:
        time.sleep(10)
        st = api('GET', f'{BASE}/{tid}')
        s = st.get('status')
        print(f'  {int(time.time()-t0)}s {s}', flush=True)
        if s == 'succeeded':
            url = st['content']['video_url']
            urllib.request.urlretrieve(url, sortie)
            print('usage', json.dumps(st.get('usage')), '->', sortie, os.path.getsize(sortie), 'octets')
            return st
        if s in ('failed', 'expired', 'cancelled'):
            raise SystemExit('echec: ' + json.dumps(st)[:1500])

if __name__ == '__main__':
    sortie = os.path.abspath(sys.argv[2])
    os.chdir(os.path.dirname(os.path.abspath(sys.argv[1])) or '.')
    spec = json.load(open(os.path.basename(sys.argv[1])))
    generer(spec, sortie)
