// ── DOCKER & K8S ── annotated manifest explorer + concept cards (refdocs.js)
// Each manifest line is [code, note]; lines with a note are focusable and explain themselves in the side panel.
const K8S_MANIFESTS=[
 {id:'deploy',label:'Deployment',lang:'yaml',intro:'Deployment ดูแลให้ Pod ตาม template รันครบตามจำนวนเสมอ และทำ rolling update ตอนเปลี่ยน image',lines:[
  ['apiVersion: apps/v1','API group / version ของ resource ชนิดนี้ (Deployment อยู่ใน apps/v1)'],
  ['kind: Deployment','ชนิดของ resource: Deployment สร้าง ReplicaSet ซึ่งสร้าง Pod อีกที'],
  ['metadata:',''],
  ['  name: order-api','ชื่อ Deployment ต้องไม่ซ้ำใน namespace'],
  ['  namespace: shop','namespace คือห้องแยกของ resource ใน cluster (dev / uat / prod มักแยก namespace หรือแยก cluster)'],
  ['spec:',''],
  ['  replicas: 2','จำนวน Pod ที่ต้องการ ถ้ามี HPA ตัว HPA จะปรับค่านี้แทน'],
  ['  selector:',''],
  ['    matchLabels:',''],
  ['      app: order-api','Deployment คุม Pod ที่มี label นี้ ต้องตรงกับ label ใน template ด้านล่าง ไม่งั้นสร้างไม่ได้'],
  ['  strategy:',''],
  ['    type: RollingUpdate','เปลี่ยน Pod ทีละตัวตอน deploy เวอร์ชันใหม่ (อีกแบบคือ Recreate = ลบทั้งหมดก่อนแล้วสร้างใหม่ ระบบล่มช่วงหนึ่ง)'],
  ['    rollingUpdate:',''],
  ['      maxSurge: 1','ระหว่าง deploy สร้าง Pod เกินจำนวน replicas ได้ 1 ตัว'],
  ['      maxUnavailable: 0','ไม่ยอมให้ Pod ที่พร้อมใช้งานลดลงเลย = deploy แบบไม่มี downtime (ต้องมี readinessProbe ถึงจะได้ผลจริง)'],
  ['  template:','แม่แบบของ Pod ทุกตัวที่ Deployment สร้าง แก้ส่วนนี้ = rollout ใหม่'],
  ['    metadata:',''],
  ['      labels:',''],
  ['        app: order-api','label ของ Pod ที่ Service ใช้เลือกส่ง traffic'],
  ['    spec:',''],
  ['      imagePullSecrets:',''],
  ['        - name: docker-secret','Secret สำหรับ login registry ส่วนตัว ถ้าไม่มีจะเจอ ImagePullBackOff'],
  ['      containers:',''],
  ['        - name: order-api',''],
  ['          image: registry.example.com/order-api:1.4.2','image ที่ใช้ ควรใช้ tag ที่ระบุเวอร์ชันชัดเจน ไม่ใช้ latest เพื่อให้ rollback ได้และรู้ว่ารันเวอร์ชันไหนอยู่'],
  ['          ports:',''],
  ['            - containerPort: 8080','port ที่แอปฟังอยู่ในคอนเทนเนอร์ (Quarkus ค่าเริ่ม 8080) เป็นข้อมูลอ้างอิง ไม่ได้เปิด port ให้ใคร'],
  ['          env:',''],
  ['            - name: QUARKUS_PROFILE',''],
  ['              value: dev','เลือก profile ของ Quarkus ค่าใน application.properties ที่ขึ้นต้นด้วย %dev. จะถูกใช้'],
  ['            - name: QUARKUS_DATASOURCE_PASSWORD','env ชื่อแบบนี้ override `quarkus.datasource.password` (ตัวใหญ่ และเปลี่ยน . เป็น _)'],
  ['              valueFrom:',''],
  ['                secretKeyRef:','ดึงค่าจาก Secret แทนการ hardcode รหัสผ่านใน YAML'],
  ['                  name: order-db',''],
  ['                  key: password',''],
  ['            - name: JAVA_OPTS_APPEND',''],
  ['              value: "-XX:MaxRAMPercentage=75.0"','heap ของ JVM = 75% ของ memory limit เหลือส่วนที่เหลือให้ metaspace / thread'],
  ['          resources:',''],
  ['            requests:','ทรัพยากรที่ scheduler จองให้ ใช้ตัดสินว่าวาง Pod บน node ไหน และเป็นฐานคำนวณ % ของ HPA'],
  ['              cpu: 250m','250m = 0.25 core'],
  ['              memory: 512Mi',''],
  ['            limits:','เพดานสูงสุด CPU เกินจะถูกหน่วง memory เกินจะถูกฆ่า (OOMKilled, exit 137)'],
  ['              cpu: "1"',''],
  ['              memory: 1Gi',''],
  ['          readinessProbe:','พร้อมรับ traffic หรือยัง ถ้าไม่ผ่าน Pod จะถูกถอดออกจาก Service ชั่วคราว (ไม่ restart)'],
  ['            httpGet:',''],
  ['              path: /q/health/ready','endpoint ของ quarkus-smallrye-health'],
  ['              port: 8080',''],
  ['            initialDelaySeconds: 10',''],
  ['          livenessProbe:','ยังทำงานอยู่ไหม ถ้าไม่ผ่านติดกันหลายครั้ง kubelet จะ restart container ตั้งเผื่อเวลา start ให้พอ ไม่งั้นจะวน restart (CrashLoopBackOff)'],
  ['            httpGet:',''],
  ['              path: /q/health/live',''],
  ['              port: 8080',''],
  ['            initialDelaySeconds: 30',''],
  ['            periodSeconds: 15',''],
 ]},
 {id:'svc',label:'Service',lang:'yaml',intro:'Service ให้ชื่อ DNS และ IP คงที่ แล้วกระจาย traffic ไปยัง Pod ที่ ready ตาม label',lines:[
  ['apiVersion: v1',''],
  ['kind: Service',''],
  ['metadata:',''],
  ['  name: order-api','ชื่อนี้กลายเป็น DNS: `order-api` (namespace เดียวกัน) หรือ `order-api.shop.svc.cluster.local` (ข้าม namespace)'],
  ['  namespace: shop',''],
  ['spec:',''],
  ['  type: ClusterIP','เข้าได้เฉพาะในคลัสเตอร์ (ค่าเริ่มต้น) · NodePort = เปิด port บนทุก node · LoadBalancer = ขอ LB จาก cloud / MetalLB'],
  ['  selector:',''],
  ['    app: order-api','ส่ง traffic ไปยัง Pod ที่มี label นี้ ถ้าพิมพ์ผิด Service จะไม่มี endpoint และ Kong ตอบ 503'],
  ['  ports:',''],
  ['    - name: http',''],
  ['      port: 80','port ของ Service ที่คนอื่นเรียก'],
  ['      targetPort: 8080','port ของ container ที่ Service ส่งต่อไปให้'],
 ]},
 {id:'ingress',label:'Ingress (Kong)',lang:'yaml',intro:'Ingress บอก Ingress Controller (ในโปรเจคนี้คือ Kong) ว่า host / path ไหนให้ส่งไป Service ไหน annotation konghq.com/* ใช้ปรับพฤติกรรมของ Kong',lines:[
  ['apiVersion: networking.k8s.io/v1',''],
  ['kind: Ingress',''],
  ['metadata:',''],
  ['  name: order-api',''],
  ['  namespace: shop',''],
  ['  annotations:',''],
  ['    konghq.com/strip-path: "false"','false = ส่ง path เต็มไป backend (/api/users ถึง backend เป็น /api/users) · true = ตัด prefix ที่ match ออกก่อน'],
  ['    konghq.com/preserve-host: "true"','ส่ง Host header เดิมของ client ไปให้ backend (เช่น Keycloak ต้องรู้ host จริงเพื่อสร้าง redirect URL)'],
  ['    konghq.com/read-timeout: "300000"','เวลารอ response จาก backend หน่วย ms (300000 = 5 นาที) ใช้กับ report ที่ใช้เวลานาน เกินจะได้ 504'],
  ['    konghq.com/plugins: ip-whitelist','ผูก KongPlugin ชื่อนี้ (ใน namespace เดียวกัน) เข้ากับ route นี้ ใส่หลายตัวคั่นด้วย comma'],
  ['spec:',''],
  ['  ingressClassName: kong','ให้ Kong Ingress Controller เป็นคนจัดการ Ingress นี้'],
  ['  tls:',''],
  ['    - hosts:',''],
  ['        - shop.example.com',''],
  ['      secretName: shop-tls','Secret ชนิด kubernetes.io/tls ที่เก็บ certificate + key ของโดเมน'],
  ['  rules:',''],
  ['    - host: shop.example.com',''],
  ['      http:',''],
  ['        paths:',''],
  ['          - path: /api','path ที่ match'],
  ['            pathType: Prefix','Prefix = /api และทุกอย่างใต้ /api/ · Exact = ต้องตรงทุกตัว'],
  ['            backend:',''],
  ['              service:',''],
  ['                name: order-api','Service ปลายทาง'],
  ['                port:',''],
  ['                  number: 80','port ของ Service (ไม่ใช่ containerPort)'],
 ]},
 {id:'plugin',label:'KongPlugin',lang:'yaml',intro:'KongPlugin คือการตั้งค่า plugin ของ Kong แบบ CRD แล้วเอาชื่อไปผูกกับ Ingress / Service ด้วย annotation konghq.com/plugins',lines:[
  ['apiVersion: configuration.konghq.com/v1',''],
  ['kind: KongPlugin','KongPlugin ใช้ใน namespace เดียวกัน · KongClusterPlugin ใช้ได้ทั้งคลัสเตอร์'],
  ['metadata:',''],
  ['  name: ip-whitelist','ชื่อที่จะอ้างใน annotation konghq.com/plugins'],
  ['  namespace: shop',''],
  ['plugin: ip-restriction','ชนิดของ plugin เช่น ip-restriction, cors, rate-limiting, response-transformer, request-transformer'],
  ['config:','ค่าตั้งของ plugin แต่ละชนิดมี key ต่างกัน'],
  ['  allow:',''],
  ['    - 10.0.0.0/8','อนุญาตเฉพาะ IP ในช่วงนี้ IP อื่นได้ 403'],
 ]},
 {id:'hpa',label:'HPA',lang:'yaml',intro:'HorizontalPodAutoscaler เพิ่ม / ลดจำนวน Pod ตามโหลด',lines:[
  ['apiVersion: autoscaling/v2',''],
  ['kind: HorizontalPodAutoscaler',''],
  ['metadata:',''],
  ['  name: order-api',''],
  ['spec:',''],
  ['  scaleTargetRef:','resource ที่จะ scale'],
  ['    apiVersion: apps/v1',''],
  ['    kind: Deployment',''],
  ['    name: order-api',''],
  ['  minReplicas: 2','ต่ำสุด อย่างน้อย 2 เพื่อไม่ล่มเวลา Pod ตัวเดียวตาย'],
  ['  maxReplicas: 6','สูงสุด ระวัง connection pool ของ DB: 6 Pod × max-size 30 = 180 connection'],
  ['  metrics:',''],
  ['    - type: Resource',''],
  ['      resource:',''],
  ['        name: cpu',''],
  ['        target:',''],
  ['          type: Utilization',''],
  ['          averageUtilization: 70','CPU เฉลี่ยเทียบกับ requests เกิน 70% → เพิ่ม Pod (ต้องตั้ง resources.requests.cpu ไว้ ไม่งั้น HPA คำนวณไม่ได้)'],
 ]},
 {id:'docker',label:'Dockerfile (Quarkus)',lang:'dockerfile',intro:'multi-stage build: stage แรก build ด้วย Maven, stage สองเหลือแค่ JRE + ไฟล์ที่ต้องรัน image เล็กและไม่มี source code',lines:[
  ['FROM maven:3.9-eclipse-temurin-21 AS build','stage สำหรับ build มี JDK + Maven ครบ ตั้งชื่อว่า build ไว้อ้างทีหลัง'],
  ['WORKDIR /src',''],
  ['COPY pom.xml .','copy pom ก่อน source เพื่อให้ layer ของ dependency ถูก cache'],
  ['RUN mvn -B dependency:go-offline','โหลด dependency ไว้ใน layer แยก แก้โค้ดแล้ว build ใหม่จะไม่ต้องโหลดซ้ำ'],
  ['COPY src ./src',''],
  ['RUN mvn -B package -DskipTests','ได้ target/quarkus-app/ (fast-jar layout)'],
  ['',''],
  ['FROM eclipse-temurin:21-jre','stage สำหรับรัน มีแค่ JRE image เล็กกว่าและผิวโจมตีน้อยกว่า'],
  ['WORKDIR /app',''],
  ['COPY --from=build /src/target/quarkus-app/ ./','copy ผลลัพธ์จาก stage build มาอย่างเดียว'],
  ['USER 1001','ไม่รันด้วย root'],
  ['EXPOSE 8080','บอกว่าแอปฟัง port ไหน (เป็นข้อมูลอ้างอิง)'],
  ['ENV JAVA_OPTS_APPEND="-XX:MaxRAMPercentage=75.0"',''],
  ['ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS_APPEND -jar quarkus-run.jar"]','ใช้ sh -c เพื่อให้ $JAVA_OPTS_APPEND ถูกแทนค่า'],
 ]},
 {id:'nginx',label:'Dockerfile (Angular + nginx)',lang:'dockerfile',intro:'build Angular ด้วย Node แล้วเสิร์ฟไฟล์ static ด้วย nginx',lines:[
  ['FROM node:20 AS build',''],
  ['WORKDIR /app',''],
  ['COPY package.json pnpm-lock.yaml .npmrc ./','.npmrc มี registry ส่วนตัว (เช่น nexus) สำหรับ @acme/* ถ้าขาดจะ install ไม่ผ่าน'],
  ['RUN corepack enable && pnpm install --frozen-lockfile','--frozen-lockfile = ห้ามแก้ lockfile ได้เวอร์ชันเดียวกับเครื่อง dev'],
  ['COPY . .',''],
  ['RUN pnpm build',''],
  ['',''],
  ['FROM nginx:1.27-alpine',''],
  ['COPY nginx.conf /etc/nginx/conf.d/default.conf','config ที่มี try_files สำหรับ SPA (ดูหน้า Request Path)'],
  ['COPY --from=build /app/dist/app/browser /usr/share/nginx/html','path ของ dist ขึ้นกับชื่อ project ใน angular.json'],
  ['EXPOSE 80',''],
 ]},
];
let _k8sCur='deploy';
function k8sInit(){
  const root=document.getElementById('k8s-explorer');
  if(!root)return;
  root.innerHTML=`<div class="json-view-toggle k8s-tabs" role="tablist" aria-label="เลือกไฟล์">${K8S_MANIFESTS.map(m=>
    `<button type="button" class="json-view-btn" role="tab" data-m="${m.id}" onclick="k8sShow('${m.id}')">${escHtml(m.label)}</button>`).join('')}</div>
  <p class="k8s-intro" id="k8s-intro"></p>
  <div class="yx">
    <div class="yx-code rxjs-code" id="k8s-code" aria-label="บรรทัดของไฟล์"></div>
    <aside class="yx-note" id="k8s-note" aria-live="polite"></aside>
  </div>`;
  k8sShow(_k8sCur);
}
function k8sShow(id){
  const m=K8S_MANIFESTS.find(x=>x.id===id);
  if(!m)return;
  _k8sCur=id;
  document.querySelectorAll('.k8s-tabs .json-view-btn').forEach(b=>{const on=b.dataset.m===id;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));});
  document.getElementById('k8s-intro').textContent=m.intro;
  const code=document.getElementById('k8s-code');
  code.innerHTML=m.lines.map(([ln,note],i)=>{
    const html=window.hljs&&ln.trim()?hljs.highlight(ln,{language:m.lang,ignoreIllegals:true}).value:escHtml(ln);
    return note
      ?`<button type="button" class="yx-line has-note" data-i="${i}" onmouseenter="k8sNote(${i})" onfocus="k8sNote(${i})" onclick="k8sNote(${i})"><span class="yx-ln">${i+1}</span><code>${html||' '}</code></button>`
      :`<div class="yx-line"><span class="yx-ln">${i+1}</span><code>${html||' '}</code></div>`;
  }).join('')+`<button type="button" class="btn btn-ghost yx-copy" onclick="k8sCopy()">${ic('copy')} คัดลอกทั้งไฟล์</button>`;
  const first=m.lines.findIndex(l=>l[1]);
  k8sNote(first);
}
function k8sNote(i){
  const m=K8S_MANIFESTS.find(x=>x.id===_k8sCur),l=m.lines[i];
  document.querySelectorAll('#k8s-code .yx-line').forEach(el=>el.classList.toggle('active',+el.dataset.i===i));
  document.getElementById('k8s-note').innerHTML=l?`<div class="yx-note-line">บรรทัด ${i+1}</div><code class="yx-note-code">${escHtml(l[0].trim())}</code><p>${refInline(l[1])}</p>`:'';
}
function k8sCopy(){const m=K8S_MANIFESTS.find(x=>x.id===_k8sCur);copyText(m.lines.map(l=>l[0]).join('\n'));}

REF_DOCS.k8s={
  placeholder:'ค้นหา... เช่น CrashLoopBackOff, Service, PVC, ConfigMap, ArgoCD',
  lang:'bash',
  items:[
  {g:'แนวคิด',t:'Image vs Container vs VM',b:'docker',bc:'blue',k:'layer namespace cgroup',
   d:'Image = แม่แบบอ่านอย่างเดียว ประกอบจาก layer หลายชั้น · Container = process ที่รันจาก image โดยแยก filesystem / network / process ด้วย namespace และจำกัดทรัพยากรด้วย cgroup ใช้ kernel ร่วมกับเครื่อง จึงเบากว่า VM ที่ต้องมี OS ของตัวเอง',
   fix:['ข้อมูลที่เขียนใน container หายเมื่อ container ถูกลบ ต้องเก็บใน volume','หนึ่ง container ควรมี process หลักเดียว'],
   code:`docker build -t order-api:1.4.2 .
docker run -d --name api -p 8080:8080 -e QUARKUS_PROFILE=dev order-api:1.4.2
docker logs -f api
docker exec -it api sh`},
  {g:'แนวคิด',t:'Pod',b:'k8s',bc:'blue',k:'sidecar ephemeral ip',
   d:'หน่วยเล็กสุดที่ Kubernetes จัดการ มี container 1 ตัวขึ้นไปที่ใช้ network (IP เดียวกัน) และ volume ร่วมกัน · Pod ตายแล้วสร้างใหม่ได้ IP ใหม่ จึงไม่ควรเรียก Pod ตรงๆ ให้เรียกผ่าน Service',
   code:`kubectl get pods -n shop -o wide
kubectl describe pod <pod> -n shop      # ดู Events ท้ายสุดเมื่อมีปัญหา`},
  {g:'แนวคิด',t:'Deployment / ReplicaSet / StatefulSet',b:'workload',bc:'blue',k:'rollout rollback stateful mariadb rabbitmq',
   d:'Deployment = แอปที่ไม่มี state (API, web) Pod แทนกันได้ · StatefulSet = แอปที่มี state ต้องการชื่อและ volume คงที่ต่อ Pod เช่น MariaDB, RabbitMQ (ในโปรเจคนี้ใช้ StatefulSet กับ RabbitmqCluster)',
   code:`kubectl rollout status deployment/order-api -n shop
kubectl rollout history deployment/order-api -n shop
kubectl rollout undo deployment/order-api -n shop      # ย้อนเวอร์ชันก่อน
kubectl rollout restart deployment/order-api -n shop   # restart ทุก Pod แบบ rolling`},
  {g:'แนวคิด',t:'Service ชนิดต่างๆ',b:'network',bc:'blue',k:'clusterip nodeport loadbalancer headless dns',
   d:'ClusterIP = ภายในคลัสเตอร์ · NodePort = เปิด port 30000-32767 บนทุก node · LoadBalancer = ได้ IP ภายนอกจาก cloud / MetalLB · Headless (`clusterIP: None`) = ได้ DNS ของ Pod แต่ละตัว ใช้กับ StatefulSet',
   code:`kubectl get svc -n shop
kubectl get endpoints order-api -n shop   # ว่าง = selector ไม่ตรง หรือ Pod ยังไม่ ready`},
  {g:'แนวคิด',t:'Ingress และ Ingress Controller',b:'network',bc:'blue',k:'kong nginx route host path tls',
   d:'Ingress เป็นแค่กฎ (host / path → Service) ต้องมี Ingress Controller มาทำตาม ในโปรเจคนี้คือ Kong ดูรายละเอียดในหน้า Request Path'},
  {g:'แนวคิด',t:'ConfigMap และ Secret',b:'config',bc:'blue',k:'base64 env volume encrypt',
   d:'ConfigMap เก็บ config ทั่วไป · Secret เก็บรหัสผ่าน / token แต่เป็นแค่ base64 ไม่ได้เข้ารหัส ใครมีสิทธิ์อ่าน Secret ก็อ่านได้ (ลองถอดด้วยหน้า K8s Secret Decoder)',
   fix:['อย่า commit Secret ลง git แบบ plain','แก้ ConfigMap / Secret แล้วต้อง restart Pod ถ้าใช้เป็น env (env อ่านครั้งเดียวตอน start)'],
   code:`kubectl create secret generic order-db -n shop \\
  --from-literal=username=app --from-literal=password='s3cret'

kubectl get secret order-db -n shop -o jsonpath='{.data.password}' | base64 -d`},
  {g:'แนวคิด',t:'PersistentVolume / PVC / StorageClass',b:'storage',bc:'blue',k:'pv pvc volume storage nfs',
   d:'PV = พื้นที่เก็บข้อมูลจริง · PVC = คำขอพื้นที่ของแอป (ขนาด, โหมดการเข้าถึง) · StorageClass = สร้าง PV ให้อัตโนมัติตาม PVC · ไฟล์ที่ upload / ฐานข้อมูลต้องอยู่บน PVC ไม่งั้นหายเมื่อ Pod ถูกสร้างใหม่',
   code:`kubectl get pv,pvc -n shop`},
  {g:'แนวคิด',t:'ArgoCD (GitOps)',b:'deploy',bc:'purple',k:'gitops sync application out of sync',
   d:'ArgoCD อ่าน manifest จาก git repo (เช่น shop-k8s) แล้วทำให้คลัสเตอร์ตรงกับ git · แก้ด้วย kubectl ตรงๆ จะถูก sync ทับ ให้แก้ใน git แทน',
   fix:['สถานะ OutOfSync = คลัสเตอร์ไม่ตรงกับ git','Degraded = resource ขึ้นแต่ไม่ healthy (เช่น Pod CrashLoopBackOff)']},
  {g:'แก้ปัญหา Pod',t:'CrashLoopBackOff',b:'status',bc:'red',k:'restart crash exit code logs previous',
   d:'container เริ่มแล้วตายซ้ำๆ Kubernetes รอนานขึ้นเรื่อยๆ ก่อน restart · สาเหตุ: แอป error ตอน start (config ขาด, ต่อ DB ไม่ได้), livenessProbe ตั้งเร็วเกิน',
   fix:['ดู log ของรอบที่ตาย: `--previous`','ดู exit code ใน describe: 1 = แอป error, 137 = ถูก kill (OOM), 143 = SIGTERM'],
   code:`kubectl logs <pod> -n shop --previous
kubectl describe pod <pod> -n shop | tail -30`},
  {g:'แก้ปัญหา Pod',t:'ImagePullBackOff / ErrImagePull',b:'status',bc:'red',k:'registry secret tag not found',
   d:'ดึง image ไม่ได้: ชื่อ / tag ผิด, ไม่มีสิทธิ์ registry (imagePullSecrets) หรือ node ต่อ registry ไม่ได้',
   code:`kubectl describe pod <pod> -n shop      # ดูข้อความใน Events
kubectl get secret docker-secret -n shop`},
  {g:'แก้ปัญหา Pod',t:'Pending',b:'status',bc:'orange',k:'insufficient cpu memory pvc unbound schedule',
   d:'scheduler หา node วางไม่ได้: ทรัพยากรไม่พอตาม requests, PVC ยังไม่ bound หรือ nodeSelector / taint ไม่ตรง',
   code:`kubectl describe pod <pod> -n shop      # FailedScheduling: Insufficient memory
kubectl top nodes`},
  {g:'แก้ปัญหา Pod',t:'OOMKilled (exit 137)',b:'status',bc:'red',k:'memory limit killed 137',
   d:'container ใช้ memory เกิน limit kernel ฆ่าทิ้ง · Java ต้องตั้ง heap ให้เหลือที่ว่าง (`-XX:MaxRAMPercentage=75.0`)',
   code:`kubectl get pod <pod> -n shop -o jsonpath='{.status.containerStatuses[0].lastState}'
kubectl top pod -n shop`},
  {g:'แก้ปัญหา Pod',t:'Running แต่เรียกไม่ได้ (503 / Connection refused)',b:'status',bc:'orange',k:'readiness endpoints selector port',
   d:'Pod ขึ้นแต่ Service ไม่มี endpoint: readinessProbe ไม่ผ่าน, label ไม่ตรง selector หรือ targetPort ผิด',
   code:`kubectl get endpoints order-api -n shop
kubectl port-forward svc/order-api 8080:80 -n shop   # ทดสอบตรงจากเครื่องเรา
curl -v http://localhost:8080/q/health`},
  ],
};
