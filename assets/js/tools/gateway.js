// ── REQUEST PATH ── browser → DNS → load balancer → Kong → Service → Pod, plus LB / Kong / Nginx cards (refdocs.js)
const GW_NODES=[
 {id:'browser',icon:'monitor',t:'Browser',s:'ผู้ใช้',
  d:'browser ส่ง HTTPS request ไปที่โดเมน ถ้าหน้าเว็บ (Angular) กับ API อยู่คนละ origin จะติด CORS ต้องให้ API / Kong ตอบ header CORS',
  err:['CORS error ใน console = ฝั่ง server ไม่ได้ตอบ Access-Control-Allow-Origin (แก้ที่ API หรือ plugin cors ของ Kong)','Mixed content = หน้า https เรียก API แบบ http']},
 {id:'dns',icon:'globe',t:'DNS',s:'ชื่อ → IP',
  d:'แปลงชื่อโดเมนเป็น IP ของ load balancer (ภายนอก) · ภายในคลัสเตอร์ CoreDNS แปลงชื่อ Service เป็น ClusterIP',
  err:['`UnknownHostException` / `ENOTFOUND` = DNS หาชื่อไม่เจอ','เปลี่ยน IP แล้วบางเครื่องยังไปที่เก่า = cache ของ DNS (TTL)'],
  code:'nslookup shop.example.com\n# ในคลัสเตอร์\nkubectl run -it --rm dns --image=busybox --restart=Never -- nslookup order-api.shop'},
 {id:'lb',icon:'shuffle',t:'Load Balancer',s:'L4 / L7',
  d:'กระจาย request ไปยังเครื่องปลายทางหลายตัว และตัดตัวที่ health check ไม่ผ่านออก · L4 ดูแค่ IP / port (TCP) เร็ว · L7 อ่าน HTTP ได้ จึงแยกตาม host / path / header และ terminate TLS ได้',
  err:['ตอบ 502 / 503 = ไม่มี backend ที่ healthy','session หลุดบ่อยเมื่อมีหลาย instance = เก็บ session ไว้ใน memory ของแต่ละเครื่อง (ใช้ token หรือ Redis แทน sticky session)']},
 {id:'kong',icon:'network',t:'Kong (Ingress / API Gateway)',s:'route + plugin',
  d:'จับคู่ host / path จาก Ingress ไปยัง Service แล้วรัน plugin ระหว่างทาง: จำกัด IP, CORS, rate limit, แก้ header, ตรวจ token · ตั้งค่าผ่าน annotation `konghq.com/*` และ KongPlugin',
  err:['404 `no Route matched with those values` = ไม่มี Ingress ที่ host / path ตรง','503 `failure to get a peer from the ring-balancer` = Service ไม่มี Pod ที่ ready','504 = backend ตอบช้ากว่า `konghq.com/read-timeout`','403 = โดน plugin เช่น ip-restriction'],
  code:'kubectl get ingress -A\nkubectl describe ingress order-api -n shop\nkubectl logs -n kong deploy/kong-gateway -c proxy --tail=100'},
 {id:'svc',icon:'server',t:'Service (ClusterIP)',s:'IP คงที่',
  d:'ชื่อ DNS + IP คงที่ภายในคลัสเตอร์ กระจาย traffic ไปยัง Pod ที่ label ตรงและ ready (kube-proxy ทำ load balance ระดับ L4)',
  err:['endpoints ว่าง = selector ไม่ตรง label หรือ readinessProbe ไม่ผ่าน','targetPort ไม่ตรงกับ port ที่แอปฟัง = connection refused'],
  code:'kubectl get endpoints order-api -n shop'},
 {id:'pod',icon:'container',t:'Pod (Quarkus / nginx)',s:'แอปจริง',
  d:'แอป Quarkus ฟังที่ 8080 ส่วนเว็บ Angular เสิร์ฟผ่าน nginx ที่ 80 · request มาถึงพร้อม header `X-Forwarded-*` บอก host / protocol เดิมของ client',
  err:['500 = error ในแอป ดู log ของ Pod','redirect ไป http แทน https = แอปไม่ได้อ่าน X-Forwarded-Proto (Quarkus: `quarkus.http.proxy.proxy-address-forwarding=true`)'],
  code:'kubectl logs -f deploy/order-api -n shop\nkubectl exec -it deploy/order-api -n shop -- curl -s localhost:8080/q/health'},
];
REF_DOCS.gateway={
  placeholder:'ค้นหา... เช่น round robin, strip-path, try_files, 504, proxy_pass',
  lang:'nginx',
  items:[
  // ── Load Balancer ──
  {g:'Load Balancer',t:'L4 vs L7',b:'LB',bc:'blue',k:'tcp http layer tls termination',
   d:'L4 (transport) ส่งต่อ TCP โดยไม่อ่านเนื้อหา เร็วและง่าย · L7 (application) อ่าน HTTP จึงแยกตาม host / path / cookie, terminate TLS, ใส่ header และ retry ได้ · Kong และ nginx เป็น L7'},
  {g:'Load Balancer',t:'อัลกอริทึมกระจายโหลด',b:'LB',bc:'blue',k:'round robin least connections ip hash weighted',
   d:'Round robin = วนทีละตัว · Least connections = ส่งให้ตัวที่งานค้างน้อยสุด (เหมาะกับ request ที่ใช้เวลาไม่เท่ากัน เช่น report) · IP hash = IP เดิมไปเครื่องเดิม · Weighted = เครื่องแรงได้สัดส่วนมากกว่า',
   code:`upstream api {
    least_conn;
    server 10.0.1.10:8080 weight=2;
    server 10.0.1.11:8080;
    server 10.0.1.12:8080 backup;     # ใช้เมื่อตัวอื่นล่มหมด
}`},
  {g:'Load Balancer',t:'Health check และ sticky session',b:'LB',bc:'blue',k:'health check sticky session affinity stateless',
   d:'LB ต้องรู้ว่าเครื่องไหนพร้อมรับงาน (health check) · sticky session ผูก user กับเครื่องเดิม แต่เครื่องนั้นล่มแล้ว session หาย',
   fix:['ทำแอปให้ stateless: เก็บ state ใน token (JWT) หรือ Redis','ใน Kubernetes ใช้ readinessProbe เป็น health check ให้ Service']},

  // ── Kong ──
  {g:'Kong',t:'Annotation ของ Kong Ingress ที่ใช้บ่อย',b:'Kong',bc:'purple',k:'konghq.com strip-path preserve-host timeout plugins protocols methods',
   d:'ใส่ใน `metadata.annotations` ของ Ingress หรือ Service',
   fix:['`konghq.com/strip-path`: ตัด path prefix ก่อนส่ง backend หรือไม่','`konghq.com/preserve-host`: ส่ง Host เดิมไป backend','`konghq.com/connect-timeout`, `read-timeout`, `write-timeout`: หน่วย ms','`konghq.com/plugins`: รายชื่อ KongPlugin คั่นด้วย comma','`konghq.com/protocols`: เช่น `https` อย่างเดียว','`konghq.com/https-redirect-status-code`: เช่น `301` ให้ http เด้งไป https','`konghq.com/methods`: จำกัด HTTP method ของ route'],
   lang:'yaml',
   code:`metadata:
  annotations:
    konghq.com/strip-path: "false"
    konghq.com/preserve-host: "true"
    konghq.com/read-timeout: "300000"
    konghq.com/protocols: "https"
    konghq.com/https-redirect-status-code: "301"
    konghq.com/plugins: ip-whitelist,cors`},
  {g:'Kong',t:'Plugin ที่ใช้บ่อย',b:'Kong',bc:'purple',k:'ip-restriction cors rate-limiting response-transformer request-transformer jwt key-auth',
   d:'ip-restriction = จำกัด IP · cors = ตอบ header CORS · rate-limiting = จำกัดจำนวนครั้งต่อช่วงเวลา · request-transformer / response-transformer = เพิ่ม ลบ แก้ header / body · jwt, key-auth, openid-connect = ตรวจตัวตน',
   lang:'yaml',
   code:`apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: cors
plugin: cors
config:
  origins:
    - https://shop.example.com
  methods: [GET, POST, PUT, DELETE, OPTIONS]
  headers: [Authorization, Content-Type]
  credentials: true
---
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: custom-headers
plugin: response-transformer
config:
  add:
    headers:
      - "X-Frame-Options: SAMEORIGIN"`},
  {g:'Kong',t:'strip-path ทำงานยังไง',b:'Kong',bc:'purple',k:'strip path prefix 404 backend',
   d:'Ingress path `/api` กับ request `/api/users`: `strip-path: "true"` ส่ง `/users` ให้ backend · `"false"` ส่ง `/api/users` เต็ม · ตั้งผิดจะได้ 404 จากแอป (ไม่ใช่จาก Kong)',
   fix:['Quarkus ที่ตั้ง `quarkus.http.root-path=/api` ต้องใช้ `strip-path: "false"`']},

  // ── Nginx ──
  {g:'Nginx',t:'โครงสร้าง config',b:'nginx',bc:'green',k:'http server location block include',
   d:'`http` (ค่าร่วม) → `server` (หนึ่งเว็บ / port / host) → `location` (กฎตาม path) · location ที่ match ยาวสุดชนะ ส่วน `=` (exact) และ regex `~` มีลำดับพิเศษ',
   code:`server {
    listen 80;
    server_name shop.example.com;

    location = /health { return 200 'ok'; }     # ตรงทุกตัว
    location /api/ { proxy_pass http://order-api:80; }
    location / { root /usr/share/nginx/html; try_files $uri $uri/ /index.html; }
}`},
  {g:'Nginx',t:'เสิร์ฟ Angular (SPA) ให้ refresh แล้วไม่ 404',b:'nginx',bc:'green',k:'try_files spa angular refresh 404 index.html cache',
   d:'route ของ Angular เช่น `/orders/search` ไม่มีไฟล์จริงบน server ต้องให้ nginx คืน `index.html` แล้วให้ Angular router จัดการ · `index.html` ห้าม cache ส่วนไฟล์ที่มี hash ในชื่อ cache ได้นาน',
   code:`server {
    listen 80;
    root /usr/share/nginx/html;

    location / {
        try_files $uri $uri/ /index.html;
    }
    location = /index.html {
        add_header Cache-Control "no-cache";
    }
    location ~* \\.(js|css|woff2|png|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
}`},
  {g:'Nginx',t:'proxy_pass กับ / ท้าย URL',b:'gotcha',bc:'red',k:'proxy_pass trailing slash path rewrite',
   d:'มี path ท้าย `proxy_pass` (แม้แค่ `/`) nginx จะแทนส่วนที่ match ด้วย path นั้น · ไม่มี path จะส่ง URI เดิมทั้งหมด',
   code:`location /api/ {
    proxy_pass http://backend:8080;      # /api/users → /api/users
}
location /api/ {
    proxy_pass http://backend:8080/;     # /api/users → /users
}`},
  {g:'Nginx',t:'Reverse proxy header และ timeout',b:'nginx',bc:'green',k:'x-forwarded-for proto host proxy_read_timeout websocket upgrade',
   d:'ส่งข้อมูล client เดิมให้ backend และขยาย timeout สำหรับงานที่ใช้เวลานาน · WebSocket ต้องส่ง header Upgrade ต่อ',
   code:`location /api/ {
    proxy_pass http://backend:8080;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 300s;
}
location /ws/ {
    proxy_pass http://backend:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade    $http_upgrade;
    proxy_set_header Connection "upgrade";
}`},

  // ── HTTP error ตามชั้น ──
  {g:'แก้ปัญหาตามชั้น',t:'413 Request Entity Too Large',b:'413',bc:'orange',k:'upload size client_max_body_size',
   d:'ไฟล์ upload ใหญ่เกินที่ proxy รับ (nginx ค่าเริ่ม 1MB) ต้องขยายทุกชั้นที่ request วิ่งผ่าน',
   code:`# nginx
client_max_body_size 20m;

# Quarkus (application.properties)
# quarkus.http.limits.max-body-size=20M`},
  {g:'แก้ปัญหาตามชั้น',t:'502 Bad Gateway',b:'502',bc:'red',k:'bad gateway upstream connection refused reset',
   d:'proxy ต่อ backend ได้แต่ได้คำตอบเสีย หรือ backend ปิด connection: แอป crash, port ผิด, Pod กำลัง restart',
   fix:['ดู log ของ proxy ว่า upstream ไหน','เช็ค Pod / endpoints ของ Service']},
  {g:'แก้ปัญหาตามชั้น',t:'503 Service Unavailable',b:'503',bc:'red',k:'no healthy upstream ring-balancer endpoints',
   d:'ไม่มี backend ที่พร้อม: Service ไม่มี endpoint (Pod ไม่ ready / selector ผิด) หรือแอปตอบ 503 เอง (กำลัง shutdown)',
   fix:['`kubectl get endpoints <svc>` ถ้าว่างให้ดู readinessProbe และ label']},
  {g:'แก้ปัญหาตามชั้น',t:'504 Gateway Timeout',b:'504',bc:'red',k:'gateway timeout read timeout slow report',
   d:'backend ตอบช้ากว่า timeout ของ proxy ชั้นใดชั้นหนึ่ง (LB, Kong, nginx) ชั้นที่ timeout สั้นสุดจะตัดก่อน',
   fix:['ไล่ timeout ทุกชั้น: LB → `konghq.com/read-timeout` → `proxy_read_timeout` → REST client','งานยาวมาก (report ใหญ่) ทำแบบ async: สั่งงาน → ได้ id → ดาวน์โหลดเมื่อเสร็จ']},
  ],
};
