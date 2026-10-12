// ── KUBECTL ──
const KUBECTL_CMDS=[
  {group:'POD',cmd:'kubectl get pods',desc:'แสดงรายการ pod ทั้งหมดใน namespace ปัจจุบัน'},
  {group:'POD',cmd:'kubectl get pods -n <namespace>',desc:'แสดง pod ใน namespace ที่ระบุ'},
  {group:'POD',cmd:'kubectl get pods -A',desc:'แสดง pod ทุก namespace ในคลัสเตอร์'},
  {group:'POD',cmd:'kubectl get pods -o wide',desc:'แสดงข้อมูลเพิ่มเติม เช่น IP address และ Node'},
  {group:'POD',cmd:'kubectl describe pod <pod-name>',desc:'แสดงรายละเอียด pod รวมถึง events และสถานะ'},
  {group:'POD',cmd:'kubectl delete pod <pod-name>',desc:'ลบ pod (จะสร้างใหม่อัตโนมัติถ้า managed โดย Deployment)'},
  {group:'POD',cmd:'kubectl get pod <pod-name> -o yaml',desc:'ดู spec ของ pod ในรูปแบบ YAML'},
  {group:'LOGS',cmd:'kubectl logs <pod-name>',desc:'ดู log ของ pod'},
  {group:'LOGS',cmd:'kubectl logs <pod-name> -f',desc:'ดู log แบบ follow (real-time stream)'},
  {group:'LOGS',cmd:'kubectl logs <pod-name> --tail=100',desc:'ดู log 100 บรรทัดล่าสุด'},
  {group:'LOGS',cmd:'kubectl logs <pod-name> -c <container>',desc:'ดู log ของ container ที่ระบุใน multi-container pod'},
  {group:'LOGS',cmd:'kubectl logs <pod-name> --previous',desc:'ดู log ของ container ที่ crash ไปแล้ว'},
  {group:'LOGS',cmd:'kubectl logs -l app=<label> --all-containers',desc:'ดู log ของทุก pod ที่มี label ตรงกัน'},
  {group:'EXEC / DEBUG',cmd:'kubectl exec -it <pod-name> -- bash',desc:'เข้า shell ภายใน pod (bash)'},
  {group:'EXEC / DEBUG',cmd:'kubectl exec -it <pod-name> -- sh',desc:'เข้า shell ภายใน pod (sh) สำหรับ Alpine image'},
  {group:'EXEC / DEBUG',cmd:'kubectl exec <pod-name> -- env',desc:'แสดง environment variables ภายใน pod'},
  {group:'EXEC / DEBUG',cmd:'kubectl exec <pod-name> -- curl http://localhost:8080/health',desc:'เรียก endpoint จากภายใน pod โดยตรง'},
  {group:'EXEC / DEBUG',cmd:'kubectl port-forward pod/<pod> 8080:8080',desc:'forward port จาก pod มายัง localhost'},
  {group:'EXEC / DEBUG',cmd:'kubectl port-forward svc/<svc> 8080:80',desc:'forward port จาก service มายัง localhost'},
  {group:'DEPLOYMENT',cmd:'kubectl get deployments',desc:'แสดงรายการ deployment ทั้งหมด'},
  {group:'DEPLOYMENT',cmd:'kubectl describe deployment <name>',desc:'ดูรายละเอียดและ events ของ deployment'},
  {group:'DEPLOYMENT',cmd:'kubectl rollout status deployment/<name>',desc:'ตรวจสอบสถานะการ deploy แบบ real-time'},
  {group:'DEPLOYMENT',cmd:'kubectl rollout restart deployment/<name>',desc:'Restart deployment แบบ rolling update'},
  {group:'DEPLOYMENT',cmd:'kubectl rollout undo deployment/<name>',desc:'Rollback deployment กลับ revision ก่อนหน้า'},
  {group:'DEPLOYMENT',cmd:'kubectl rollout history deployment/<name>',desc:'ดูประวัติการ deploy ทั้งหมด'},
  {group:'DEPLOYMENT',cmd:'kubectl scale deployment <name> --replicas=3',desc:'เพิ่มหรือลด replica ของ deployment'},
  {group:'DEPLOYMENT',cmd:'kubectl set image deployment/<name> <container>=<image>:<tag>',desc:'อัปเดต image ของ deployment'},
  {group:'SERVICE & INGRESS',cmd:'kubectl get svc',desc:'แสดงรายการ service ทั้งหมด'},
  {group:'SERVICE & INGRESS',cmd:'kubectl get ingress',desc:'แสดงรายการ ingress ทั้งหมด'},
  {group:'SERVICE & INGRESS',cmd:'kubectl describe svc <name>',desc:'ดูรายละเอียด service รวม endpoint'},
  {group:'SERVICE & INGRESS',cmd:'kubectl get endpoints <svc-name>',desc:'ดู IP:Port ของ pod ที่ service ชี้ถึง'},
  {group:'CONFIGMAP & SECRET',cmd:'kubectl get configmaps',desc:'แสดงรายการ configmap'},
  {group:'CONFIGMAP & SECRET',cmd:'kubectl get secrets',desc:'แสดงรายการ secret'},
  {group:'CONFIGMAP & SECRET',cmd:"kubectl get secret <name> -o jsonpath='{.data.<key>}' | base64 -d",desc:'อ่านค่า secret แล้ว decode จาก base64'},
  {group:'NAMESPACE',cmd:'kubectl get namespaces',desc:'แสดง namespace ทั้งหมดในคลัสเตอร์'},
  {group:'NAMESPACE',cmd:'kubectl config set-context --current --namespace=<ns>',desc:'เปลี่ยน default namespace ของ context ปัจจุบัน'},
  {group:'NODE & CLUSTER',cmd:'kubectl get nodes',desc:'แสดงรายการ node ทั้งหมดในคลัสเตอร์'},
  {group:'NODE & CLUSTER',cmd:'kubectl top nodes',desc:'ดู CPU/Memory usage ของแต่ละ node'},
  {group:'NODE & CLUSTER',cmd:'kubectl top pods',desc:'ดู CPU/Memory usage ของแต่ละ pod'},
  {group:'NODE & CLUSTER',cmd:'kubectl cluster-info',desc:'แสดงข้อมูล cluster และ API server endpoint'},
  {group:'APPLY & MANAGE',cmd:'kubectl apply -f <file.yaml>',desc:'สร้างหรืออัปเดต resource จาก YAML file'},
  {group:'APPLY & MANAGE',cmd:'kubectl apply -f <dir>/',desc:'Apply ทุก YAML file ใน directory'},
  {group:'APPLY & MANAGE',cmd:'kubectl delete -f <file.yaml>',desc:'ลบ resource ที่กำหนดใน YAML file'},
  {group:'APPLY & MANAGE',cmd:'kubectl diff -f <file.yaml>',desc:'เปรียบเทียบ YAML file กับ resource ที่รันอยู่'},
  {group:'APPLY & MANAGE',cmd:'kubectl get all -n <namespace>',desc:'แสดง resource ทุกประเภทใน namespace'},
  {group:'CONTEXT / CONFIG',cmd:'kubectl config get-contexts',desc:'แสดง context ทั้งหมดที่มีใน kubeconfig'},
  {group:'CONTEXT / CONFIG',cmd:'kubectl config use-context <name>',desc:'สลับไปใช้ context อื่น (เปลี่ยน cluster หรือ namespace)'},
  {group:'CONTEXT / CONFIG',cmd:'kubectl config current-context',desc:'แสดง context ที่กำลังใช้งานอยู่'},
  {group:"VOLUME & MOUNT",cmd:"kubectl create configmap app-config --from-file=app-config.json -n shop",desc:"สร้าง ConfigMap จากไฟล์ (ชื่อไฟล์กลายเป็น key)"},
  {group:"VOLUME & MOUNT",cmd:"kubectl create configmap app-config --from-file=config/ -n shop --dry-run=client -o yaml | kubectl apply -f -",desc:"สร้างหรืออัปเดต ConfigMap จากทุกไฟล์ในโฟลเดอร์ (ใช้ซ้ำได้)"},
  {group:"VOLUME & MOUNT",cmd:"kubectl describe pod <pod> -n shop | sed -n '/Mounts:/,/Conditions:/p'",desc:"ดูว่า container mount volume อะไรไว้ที่ path ไหน"},
  {group:"VOLUME & MOUNT",cmd:"kubectl exec -n shop <pod> -- ls -la /work/upload",desc:"ดูไฟล์และสิทธิ์ (owner / group) ใน path ที่ mount"},
  {group:"VOLUME & MOUNT",cmd:"kubectl exec -n shop <pod> -- id",desc:"ดู uid / gid ที่แอปรันอยู่ (เทียบกับเจ้าของไฟล์เมื่อเจอ Permission denied)"},
  {group:"VOLUME & MOUNT",cmd:"kubectl cp shop/<pod>:/work/upload/report.pdf ./report.pdf",desc:"ดึงไฟล์ออกจาก Pod (ต้องมี tar ใน image)"},
  {group:"VOLUME & MOUNT",cmd:"kubectl get pvc,pv -n shop",desc:"ดูสถานะ PVC / PV: Bound = ใช้ได้, Pending = ยังหา PV ที่ตรงไม่ได้"},
  {group:"VOLUME & MOUNT",cmd:"kubectl describe pvc <name> -n shop",desc:"ดู Events ว่าทำไม PVC ค้าง Pending"},
  {group:"SECRET (ปลอดภัย)",cmd:"kubectl create secret generic <name> -n shop --from-literal=password=<value> --dry-run=client -o yaml | kubeseal --format yaml > sealed.yaml",desc:"เข้ารหัสเป็น SealedSecret ก่อน commit ลง git"},
  {group:"SECRET (ปลอดภัย)",cmd:"kubectl create secret docker-registry registry-cred -n shop --docker-server=registry.example.com --docker-username=<user> --docker-password=<token>",desc:"Secret สำหรับ imagePullSecrets"},
  {group:"SECRET (ปลอดภัย)",cmd:"kubectl get secret <name> -n shop -o jsonpath='{.data}' | jq 'keys'",desc:"ดูว่ามี key อะไรบ้างโดยไม่แสดงค่า"},
  {group:"EVENTS & DEBUG",cmd:"kubectl get events -n shop --sort-by=.lastTimestamp | tail -20",desc:"เหตุการณ์ล่าสุดของ namespace (scheduling, pull image, probe)"},
  {group:"EVENTS & DEBUG",cmd:"kubectl get pods -n shop -w",desc:"ดูสถานะ Pod เปลี่ยนแบบสด ระหว่าง rollout"},
  {group:"EVENTS & DEBUG",cmd:"kubectl debug -it <pod> -n shop --image=busybox:1.36 --target=<container>",desc:"แนบ container ชั่วคราวเข้า Pod ที่ไม่มี shell (เช่น native image)"},
  {group:"EVENTS & DEBUG",cmd:"kubectl run -it --rm dns-test --image=busybox:1.36 --restart=Never -n shop -- nslookup order-api",desc:"ทดสอบ DNS / การเรียก Service จากในคลัสเตอร์"},
  {group:"EVENTS & DEBUG",cmd:"kubectl auth can-i list pods -n shop --as=system:serviceaccount:shop:<sa>",desc:"ทดสอบสิทธิ์ RBAC ของ ServiceAccount"},
  {group:"HELM",cmd:"helm template <release> ./chart -f values-prod.yaml",desc:"ดู YAML ที่ได้จริงก่อน deploy"},
  {group:"HELM",cmd:"helm upgrade --install <release> ./chart -n shop -f values-prod.yaml",desc:"ติดตั้งครั้งแรกหรืออัปเกรด (คำสั่งเดียวใช้ได้ทั้งสองกรณี)"},
  {group:"HELM",cmd:"helm list -n shop",desc:"release ที่ติดตั้งอยู่"},
  {group:"HELM",cmd:"helm rollback <release> <revision> -n shop",desc:"ย้อน release ไปรุ่นก่อน"},
  {group:"ARGOCD",cmd:"argocd app get <app> --refresh",desc:"ดูสถานะ sync / health และให้อ่าน git ใหม่ทันที"},
  {group:"ARGOCD",cmd:"argocd app diff <app>",desc:"ดูว่าคลัสเตอร์ต่างจาก git ตรงไหน (OutOfSync)"},
  {group:"ARGOCD",cmd:"argocd app sync <app> --prune",desc:"sync ทันที และลบ resource ที่ไม่มีใน git แล้ว"},
  {group:"ARGOCD",cmd:"argocd app history <app>",desc:"ประวัติการ sync และ commit ที่ใช้"},
];

function renderCmdList(cmds,containerId,searchQuery){
  const container=document.getElementById(containerId);container.innerHTML='';
  if(!cmds.length){const e=document.createElement('div');e.style.cssText='color:var(--text-dim);text-align:center;padding:40px;';e.textContent='ไม่พบคำสั่งที่ตรงกัน';container.appendChild(e);return;}
  const groups={};
  for(const c of cmds){if(!groups[c.group])groups[c.group]=[];groups[c.group].push(c);}
  for(const[grp,items]of Object.entries(groups)){
    const gDiv=document.createElement('div');gDiv.className='kubectl-group';
    const gt=document.createElement('div');gt.className='kubectl-group-title';gt.textContent=grp;gDiv.appendChild(gt);
    for(const item of items){
      const card=document.createElement('div');card.className='cmd-card';
      card.title='คลิกเพื่อ copy';
      const txt=document.createElement('div');txt.style.flex='1';
      const codeEl=document.createElement('div');codeEl.className='cmd-code';
      const descEl=document.createElement('div');descEl.className='cmd-desc';
      if(searchQuery&&searchQuery.trim()){
        codeEl.innerHTML=highlightText(item.cmd,searchQuery);
        descEl.innerHTML=highlightText(item.desc,searchQuery);
      }else{
        codeEl.textContent=item.cmd;descEl.textContent=item.desc;
      }
      txt.appendChild(codeEl);txt.appendChild(descEl);
      const copyBtn=document.createElement('button');copyBtn.className='btn btn-ghost';copyBtn.textContent='คัดลอก';copyBtn.setAttribute('aria-label','คัดลอก '+item.cmd);
      copyBtn.onclick=e=>{e.stopPropagation();copyText(item.cmd);};
      card.onclick=()=>copyText(item.cmd);
      card.appendChild(txt);card.appendChild(copyBtn);
      gDiv.appendChild(card);
    }
    container.appendChild(gDiv);
  }
}

function filterKubectl(q){
  const query=(q||'').trim().toLowerCase();
  const cmds=query?KUBECTL_CMDS.filter(c=>c.cmd.toLowerCase().includes(query)||c.desc.toLowerCase().includes(query)||c.group.toLowerCase().includes(query)):KUBECTL_CMDS;
  renderCmdList(cmds,'kubectl-list',query);
}
function clearKubectl(){document.getElementById('kubectl-search').value='';renderCmdList(KUBECTL_CMDS,'kubectl-list','');}

// ── LINUX COMMANDS ──
const LINUX_CMDS=[
  {group:'FILE & DIRECTORY',cmd:'ls -la',desc:'แสดงไฟล์ทั้งหมดรวม hidden files พร้อมสิทธิ์'},
  {group:'FILE & DIRECTORY',cmd:'find /path -name "*.log" -mtime -7',desc:'ค้นหาไฟล์ .log ที่แก้ไขภายใน 7 วัน'},
  {group:'FILE & DIRECTORY',cmd:'find /path -type f -size +100M',desc:'ค้นหาไฟล์ที่มีขนาดใหญ่กว่า 100MB'},
  {group:'FILE & DIRECTORY',cmd:'du -sh /path/*',desc:'แสดงขนาดของไฟล์และ directory แต่ละรายการ'},
  {group:'FILE & DIRECTORY',cmd:'df -h',desc:'แสดงพื้นที่ disk ทั้งหมดในระบบ'},
  {group:'FILE & DIRECTORY',cmd:'cp -r src/ dest/',desc:'คัดลอก directory ทั้งหมดพร้อม recursive'},
  {group:'FILE & DIRECTORY',cmd:'tar -czf archive.tar.gz /path',desc:'บีบอัด directory เป็น .tar.gz'},
  {group:'FILE & DIRECTORY',cmd:'tar -xzf archive.tar.gz -C /target',desc:'แตก archive .tar.gz ไปยัง directory ที่ระบุ'},
  {group:'TEXT & SEARCH',cmd:'grep -rn "pattern" /path',desc:'ค้นหา text ใน file ทุกไฟล์แบบ recursive'},
  {group:'TEXT & SEARCH',cmd:'grep -v "pattern" file.log',desc:'แสดงบรรทัดที่ไม่ตรง pattern'},
  {group:'TEXT & SEARCH',cmd:'grep -E "error|warn|fatal" app.log',desc:'ค้นหาด้วย regex หลาย pattern พร้อมกัน'},
  {group:'TEXT & SEARCH',cmd:'tail -f /var/log/syslog',desc:'ดู log แบบ real-time (follow mode)'},
  {group:'TEXT & SEARCH',cmd:'tail -n 200 app.log',desc:'แสดง 200 บรรทัดล่าสุดของ log'},
  {group:'TEXT & SEARCH',cmd:"awk '{print $1}' file.txt",desc:'ดึงคอลัมน์แรกออกจาก file'},
  {group:'TEXT & SEARCH',cmd:"sed -i 's/old/new/g' file.txt",desc:'แทนที่ text ทุกตำแหน่งใน file'},
  {group:'PROCESS',cmd:'ps aux | grep <process>',desc:'ดู process ที่รันอยู่และกรองตามชื่อ'},
  {group:'PROCESS',cmd:'top',desc:'แสดง process แบบ real-time พร้อม CPU/Memory usage'},
  {group:'PROCESS',cmd:'htop',desc:'แสดง process แบบ interactive (ต้องติดตั้งก่อน)'},
  {group:'PROCESS',cmd:'kill -9 <pid>',desc:'บังคับหยุด process ด้วย PID (SIGKILL)'},
  {group:'PROCESS',cmd:'kill -15 <pid>',desc:'ขอให้ process หยุดอย่างนุ่มนวล (SIGTERM)'},
  {group:'PROCESS',cmd:'lsof -i :<port>',desc:'ดูว่า process ใดใช้ port ที่ระบุอยู่'},
  {group:'NETWORK',cmd:'netstat -tlnp',desc:'แสดง port ทั้งหมดที่กำลัง listen พร้อม PID'},
  {group:'NETWORK',cmd:'ss -tlnp',desc:'แสดง socket/port ที่เปิดอยู่ (ทางเลือกแทน netstat)'},
  {group:'NETWORK',cmd:'curl -v http://localhost:8080/health',desc:'ทดสอบ HTTP endpoint พร้อมแสดง header'},
  {group:'NETWORK',cmd:'ping -c 4 google.com',desc:'ทดสอบการเชื่อมต่อเครือข่าย 4 ครั้ง'},
  {group:'NETWORK',cmd:'traceroute google.com',desc:'ดูเส้นทาง network packet ไปยังปลายทาง'},
  {group:'NETWORK',cmd:'wget -O file.zip https://example.com/file.zip',desc:'ดาวน์โหลดไฟล์จาก URL'},
  {group:'NETWORK',cmd:'nmap -sV <host>',desc:'ตรวจสอบ port และ service version ของ host'},
  {group:'SERVICE (systemd)',cmd:'systemctl status <service>',desc:'ดูสถานะ service'},
  {group:'SERVICE (systemd)',cmd:'systemctl start <service>',desc:'เริ่ม service'},
  {group:'SERVICE (systemd)',cmd:'systemctl stop <service>',desc:'หยุด service'},
  {group:'SERVICE (systemd)',cmd:'systemctl restart <service>',desc:'รีสตาร์ท service'},
  {group:'SERVICE (systemd)',cmd:'systemctl enable <service>',desc:'ตั้งให้ service เริ่มอัตโนมัติเมื่อ boot'},
  {group:'SERVICE (systemd)',cmd:'journalctl -u <service> -f',desc:'ดู log ของ service แบบ real-time'},
  {group:'SERVICE (systemd)',cmd:'journalctl -u <service> --since "1 hour ago"',desc:'ดู log ย้อนหลัง 1 ชั่วโมง'},
  {group:'PERMISSION',cmd:'chmod 755 file.sh',desc:'ตั้งสิทธิ์ให้ owner rwx, group/others rx'},
  {group:'PERMISSION',cmd:'chmod +x script.sh',desc:'เพิ่มสิทธิ์ execute ให้ script'},
  {group:'PERMISSION',cmd:'chown user:group file',desc:'เปลี่ยน owner และ group ของไฟล์'},
  {group:'PERMISSION',cmd:'chown -R user:group /path',desc:'เปลี่ยน owner ทุกไฟล์ใน directory แบบ recursive'},
  {group:'PACKAGE (APT)',cmd:'apt update && apt upgrade',desc:'อัปเดตรายการ package และติดตั้งเวอร์ชันใหม่'},
  {group:'PACKAGE (APT)',cmd:'apt install <package>',desc:'ติดตั้ง package ใหม่'},
  {group:'PACKAGE (APT)',cmd:'apt remove <package>',desc:'ลบ package'},
  {group:'PACKAGE (APT)',cmd:'apt list --installed | grep <name>',desc:'ตรวจสอบว่า package ติดตั้งแล้วหรือยัง'},
  {group:'PACKAGE (YUM/DNF)',cmd:'yum install <package>',desc:'ติดตั้ง package บน RHEL/CentOS (yum)'},
  {group:'PACKAGE (YUM/DNF)',cmd:'dnf install <package>',desc:'ติดตั้ง package บน Fedora/RHEL 8+ (dnf)'},
  {group:'DISK & MEMORY',cmd:'free -h',desc:'แสดงการใช้งาน RAM และ swap'},
  {group:'DISK & MEMORY',cmd:'vmstat 1',desc:'แสดง CPU, memory, swap แบบ real-time ทุก 1 วินาที'},
  {group:'DISK & MEMORY',cmd:'iostat -x 1',desc:'ดู disk I/O usage แบบ real-time'},
  {group:'DISK & MEMORY',cmd:'lsblk',desc:'แสดง block device ทั้งหมดในระบบ'},
];

function filterLinux(q){
  const query=(q||'').trim().toLowerCase();
  const all=_linuxView==='fhs'?LINUX_FHS:LINUX_CMDS;
  const cmds=query?all.filter(c=>c.cmd.toLowerCase().includes(query)||c.desc.toLowerCase().includes(query)||c.group.toLowerCase().includes(query)):all;
  renderCmdList(cmds,'linux-list',query);
}
function clearLinux(){document.getElementById('linux-search').value='';filterLinux('');}

// ── GIT CLI ──
const GIT_CMDS=[
  // SETUP / CONFIG
  {group:'SETUP / CONFIG',cmd:'git config --global user.name "Name"',desc:'ตั้งชื่อผู้ใช้ระดับ global'},
  {group:'SETUP / CONFIG',cmd:'git config --global user.email "email"',desc:'ตั้งอีเมลระดับ global'},
  {group:'SETUP / CONFIG',cmd:'git config --global pull.rebase true',desc:'ทำให้ git pull ใช้ rebase แทน merge เป็น default'},
  {group:'SETUP / CONFIG',cmd:'git config --global push.autoSetupRemote true',desc:'push branch ใหม่โดยไม่ต้องพิมพ์ -u origin ทุกครั้ง'},
  {group:'SETUP / CONFIG',cmd:'git config --global rerere.enabled true',desc:'จำ conflict resolution ไว้ใช้ซ้ำอัตโนมัติ'},
  {group:'SETUP / CONFIG',cmd:'git config --global core.autocrlf input',desc:'แก้ปัญหา CRLF บน Windows (แนะนำ)'},
  {group:'SETUP / CONFIG',cmd:'git config --list',desc:'แสดง config ทั้งหมดที่ใช้งานอยู่'},
  {group:'SETUP / CONFIG',cmd:'git init',desc:'สร้าง Git repository ใหม่ในโฟลเดอร์ปัจจุบัน'},
  {group:'SETUP / CONFIG',cmd:'git clone <url>',desc:'clone repository จาก remote'},
  {group:'SETUP / CONFIG',cmd:'git clone <url> --depth 1',desc:'clone เฉพาะ commit ล่าสุด (เร็วกว่าสำหรับ repo ขนาดใหญ่)'},
  // BASIC
  {group:'BASIC',cmd:'git status',desc:'แสดงสถานะไฟล์ (staged / unstaged / untracked)'},
  {group:'BASIC',cmd:'git diff',desc:'ดูการเปลี่ยนแปลงที่ยังไม่ได้ stage'},
  {group:'BASIC',cmd:'git diff --staged',desc:'ดูการเปลี่ยนแปลงที่ stage แล้ว ก่อน commit'},
  {group:'BASIC',cmd:'git diff main..HEAD',desc:'ดูความต่างระหว่าง branch ปัจจุบันกับ main'},
  {group:'BASIC',cmd:'git add <file>',desc:'stage ไฟล์ที่ระบุ'},
  {group:'BASIC',cmd:'git add -p',desc:'เลือก stage ทีละ hunk: ควบคุมได้ละเอียดกว่า git add .'},
  {group:'BASIC',cmd:'git commit -m "message"',desc:'commit พร้อม message'},
  {group:'BASIC',cmd:'git commit --amend --no-edit',desc:'แก้ไข commit ล่าสุดโดยไม่เปลี่ยน message (ยังไม่ push เท่านั้น)'},
  {group:'BASIC',cmd:'git log --oneline --graph --all',desc:'แสดง history ทุก branch แบบกราฟ'},
  {group:'BASIC',cmd:'git log --oneline -10',desc:'แสดง 10 commit ล่าสุด'},
  {group:'BASIC',cmd:'git log -p <file>',desc:'ดู history ของไฟล์นั้นพร้อม diff ทุก commit'},
  {group:'BASIC',cmd:'git show <hash>',desc:'แสดงรายละเอียดและ diff ของ commit นั้น'},
  {group:'BASIC',cmd:'git blame <file>',desc:'แสดงว่าใคร / commit ไหนแก้แต่ละบรรทัด'},
  // BRANCH
  {group:'BRANCH',cmd:'git branch',desc:'แสดง branch ทั้งหมด (local)'},
  {group:'BRANCH',cmd:'git branch -a',desc:'แสดง branch ทั้งหมดรวม remote'},
  {group:'BRANCH',cmd:'git switch -c feature/xxx',desc:'สร้าง branch ใหม่แล้วสลับไปทันที (แนะนำกว่า checkout -b)'},
  {group:'BRANCH',cmd:'git switch main',desc:'สลับไป branch main'},
  {group:'BRANCH',cmd:'git switch -',desc:'สลับกลับ branch ก่อนหน้า'},
  {group:'BRANCH',cmd:'git branch -d feature/xxx',desc:'ลบ branch local (ป้องกันถ้ายังไม่ merge)'},
  {group:'BRANCH',cmd:'git branch -D feature/xxx',desc:'ลบ branch local แบบบังคับ'},
  {group:'BRANCH',cmd:'git merge feature/xxx',desc:'merge branch เข้า branch ปัจจุบัน'},
  {group:'BRANCH',cmd:'git merge --no-ff feature/xxx',desc:'merge พร้อมสร้าง merge commit เสมอ (เก็บ history)'},
  {group:'BRANCH',cmd:'git cherry-pick <hash>',desc:'เอาเฉพาะ commit นั้นมาใส่ branch ปัจจุบัน'},
  // REMOTE
  {group:'REMOTE',cmd:'git remote -v',desc:'แสดง remote URLs ทั้งหมด'},
  {group:'REMOTE',cmd:'git remote add origin <url>',desc:'เพิ่ม remote ชื่อ origin'},
  {group:'REMOTE',cmd:'git fetch',desc:'ดึงข้อมูลจาก remote โดยไม่ merge'},
  {group:'REMOTE',cmd:'git fetch --prune',desc:'ดึงข้อมูลและลบ remote-tracking branch ที่ถูกลบแล้ว'},
  {group:'REMOTE',cmd:'git pull --rebase',desc:'pull แบบ rebase: ไม่สร้าง merge commit เพิ่มเติม'},
  {group:'REMOTE',cmd:'git push -u origin <branch>',desc:'push และ set upstream ครั้งแรก'},
  {group:'REMOTE',cmd:'git push',desc:'push branch ปัจจุบันไป remote'},
  {group:'REMOTE',cmd:'git push --force-with-lease',desc:'force push แบบ safe: ยกเลิกถ้ามีคนอื่น push ก่อน'},
  {group:'REMOTE',cmd:'git push origin --delete <branch>',desc:'ลบ branch บน remote'},
  // UNDO / RESET
  {group:'UNDO / RESET',cmd:'git restore <file>',desc:'ยกเลิก unstaged changes ของไฟล์นั้น'},
  {group:'UNDO / RESET',cmd:'git restore --staged <file>',desc:'unstage ไฟล์ (เก็บการเปลี่ยนแปลงไว้)'},
  {group:'UNDO / RESET',cmd:'git revert <hash>',desc:'undo commit โดยสร้าง commit ใหม่: safe สำหรับ shared branch'},
  {group:'UNDO / RESET',cmd:'git reset --soft HEAD~1',desc:'ย้อน 1 commit กลับมา staging area (เก็บ changes)'},
  {group:'UNDO / RESET',cmd:'git reset --mixed HEAD~1',desc:'ย้อน 1 commit กลับมา working tree (unstaged)'},
  {group:'UNDO / RESET',cmd:'git reset --hard HEAD~1',desc:'ระวัง: ย้อน 1 commit และทิ้งการเปลี่ยนแปลงทั้งหมด'},
  {group:'UNDO / RESET',cmd:'git clean -fd',desc:'ระวัง: ลบไฟล์ untracked ทั้งหมด (-f force, -d รวม directory)'},
  {group:'UNDO / RESET',cmd:'git reflog',desc:'ดู history ทุกการเคลื่อนไหวของ HEAD: ใช้กู้คืน commit ที่หายไป'},
  // STASH
  {group:'STASH',cmd:'git stash push -m "wip: xxx"',desc:'บันทึก work-in-progress ชั่วคราวพร้อม message'},
  {group:'STASH',cmd:'git stash list',desc:'แสดง stash ทั้งหมด'},
  {group:'STASH',cmd:'git stash pop',desc:'คืนค่า stash ล่าสุดแล้วลบ stash นั้น'},
  {group:'STASH',cmd:'git stash apply stash@{1}',desc:'คืนค่า stash ที่ระบุโดยไม่ลบ'},
  {group:'STASH',cmd:'git stash drop stash@{0}',desc:'ลบ stash ที่ระบุ'},
  {group:'STASH',cmd:'git stash clear',desc:'ลบ stash ทั้งหมด'},
  {group:'STASH',cmd:'git stash push --include-untracked',desc:'stash รวม untracked files ด้วย'},
  // REBASE
  {group:'REBASE',cmd:'git rebase main',desc:'rebase branch ปัจจุบันบน main: ทำ history เป็นเส้นตรง'},
  {group:'REBASE',cmd:'git rebase -i HEAD~3',desc:'interactive rebase 3 commit ล่าสุด: squash / reorder / edit'},
  {group:'REBASE',cmd:'git rebase --continue',desc:'ดำเนินต่อหลังแก้ conflict'},
  {group:'REBASE',cmd:'git rebase --abort',desc:'ยกเลิก rebase และกลับสู่สถานะเดิม'},
  {group:'REBASE',cmd:'git rebase --skip',desc:'ข้าม commit ที่มี conflict แล้วดำเนินต่อ'},
  // SEARCH & INSPECT
  {group:'SEARCH & INSPECT',cmd:'git log --all -S "keyword"',desc:'ค้นหา commit ที่เพิ่มหรือลบ keyword นั้น'},
  {group:'SEARCH & INSPECT',cmd:'git log --all --grep="message"',desc:'ค้นหา commit ที่ message ตรงกับ pattern'},
  {group:'SEARCH & INSPECT',cmd:'git grep "pattern"',desc:'ค้นหา pattern ใน tracked files ทั้งหมด'},
  {group:'SEARCH & INSPECT',cmd:'git bisect start',desc:'เริ่มค้นหา commit ที่ทำให้ bug เกิด (binary search)'},
  {group:'SEARCH & INSPECT',cmd:'git bisect good <hash>',desc:'ระบุ commit ที่ยังไม่มี bug'},
  {group:'SEARCH & INSPECT',cmd:'git bisect bad <hash>',desc:'ระบุ commit ที่มี bug แล้ว (bisect จะ checkout กึ่งกลางให้)'},
  {group:'SEARCH & INSPECT',cmd:'git bisect reset',desc:'จบการใช้ bisect และกลับสู่ HEAD เดิม'},
  {group:'SEARCH & INSPECT',cmd:'git shortlog -sn',desc:'สรุปจำนวน commit ต่อคน เรียงจากมากไปน้อย'},
  {group:'SEARCH & INSPECT',cmd:'git ls-files',desc:'แสดงไฟล์ทั้งหมดที่ Git track อยู่'},
];
function filterGit(q){
  const query=(q||'').trim().toLowerCase();
  const cmds=query?GIT_CMDS.filter(c=>c.cmd.toLowerCase().includes(query)||c.desc.toLowerCase().includes(query)||c.group.toLowerCase().includes(query)):GIT_CMDS;
  renderCmdList(cmds,'git-list',query);
}
function clearGit(){document.getElementById('git-search').value='';renderCmdList(GIT_CMDS,'git-list','');}

// ── CLI CHEATSHEETS (Docker / DB2 CLP / Maven / pnpm) ──
const CLI_SETS={
  docker:[
    {group:'IMAGE',cmd:'docker build -t order-api:1.4.2 .',desc:'build image จาก Dockerfile ในโฟลเดอร์ปัจจุบัน พร้อมตั้งชื่อ:tag'},
    {group:'IMAGE',cmd:'docker images',desc:'แสดง image ที่มีในเครื่อง'},
    {group:'IMAGE',cmd:'docker tag order-api:1.4.2 registry.example.com/order-api:1.4.2',desc:'ตั้งชื่อใหม่ให้ชี้ไป registry ก่อน push'},
    {group:'IMAGE',cmd:'docker push registry.example.com/order-api:1.4.2',desc:'ส่ง image ขึ้น registry (ต้อง docker login ก่อน)'},
    {group:'IMAGE',cmd:'docker login registry.example.com',desc:'login registry ส่วนตัว'},
    {group:'IMAGE',cmd:'docker image prune -a',desc:'ลบ image ที่ไม่มี container ใช้ คืนพื้นที่ดิสก์'},
    {group:'CONTAINER',cmd:'docker run -d --name api -p 8080:8080 -e QUARKUS_PROFILE=dev order-api:1.4.2',desc:'รัน container เบื้องหลัง เปิด port 8080 และส่ง env'},
    {group:'CONTAINER',cmd:'docker ps -a',desc:'แสดง container ทั้งหมดรวมที่หยุดแล้ว'},
    {group:'CONTAINER',cmd:'docker logs -f --tail 200 api',desc:'ดู log ต่อเนื่อง 200 บรรทัดล่าสุด'},
    {group:'CONTAINER',cmd:'docker exec -it api sh',desc:'เข้า shell ใน container ที่รันอยู่'},
    {group:'CONTAINER',cmd:'docker stop api && docker rm api',desc:'หยุดและลบ container'},
    {group:'CONTAINER',cmd:'docker inspect api',desc:'ดูรายละเอียด: IP, mount, env, สถานะ'},
    {group:'CONTAINER',cmd:'docker stats',desc:'ดู CPU / memory ของ container แบบ real-time'},
    {group:'CONTAINER',cmd:'docker cp api:/tmp/heap.hprof .',desc:'copy ไฟล์ออกจาก container (เช่น heap dump)'},
    {group:'COMPOSE',cmd:'docker compose up -d',desc:'รันทุก service ใน docker-compose.yaml เบื้องหลัง'},
    {group:'COMPOSE',cmd:'docker compose logs -f keycloak',desc:'ดู log ของ service เดียว'},
    {group:'COMPOSE',cmd:'docker compose down -v',desc:'หยุดและลบ container + volume (ข้อมูลใน DB หาย)'},
    {group:'COMPOSE',cmd:'docker compose ps',desc:'สถานะของ service ใน compose'},
    {group:'CLEANUP',cmd:'docker system df',desc:'ดูว่า image / container / volume ใช้ดิสก์เท่าไร'},
    {group:'CLEANUP',cmd:'docker system prune',desc:'ลบ container ที่หยุด, network และ cache ที่ไม่ใช้'},
    {group:"VOLUME",cmd:"docker run -d -v \"$PWD/nginx.conf:/etc/nginx/conf.d/default.conf:ro\" -p 8080:80 nginx:1.27-alpine",desc:"bind mount ไฟล์ config จากเครื่องเรา (:ro = อ่านอย่างเดียว)"},
    {group:"VOLUME",cmd:"docker run --rm --mount type=bind,src=\"$PWD/config\",dst=/work/config,readonly order-api:1.4.2",desc:"--mount: error ทันทีถ้า path ต้นทางไม่มี (-v จะสร้างโฟลเดอร์เปล่าให้)"},
    {group:"VOLUME",cmd:"docker volume ls",desc:"รายชื่อ named volume"},
    {group:"VOLUME",cmd:"docker volume inspect <volume>",desc:"ดูว่าข้อมูลของ volume อยู่ที่ไหนบนเครื่อง"},
    {group:"VOLUME",cmd:"docker run --rm -v <volume>:/data -v \"$PWD:/backup\" alpine tar czf /backup/data.tgz -C /data .",desc:"backup named volume ออกมาเป็นไฟล์"},
    {group:"BUILD",cmd:"docker build -f src/main/docker/Dockerfile.jvm -t order-api:1.4.2 .",desc:"build ด้วย Dockerfile ที่ไม่ได้อยู่ใน root ของโปรเจค (Quarkus)"},
    {group:"BUILD",cmd:"docker build --no-cache -t order-api:1.4.2 .",desc:"build ใหม่หมดไม่ใช้ cache ของ layer"},
    {group:"BUILD",cmd:"docker history order-api:1.4.2",desc:"ดูขนาดของแต่ละ layer หาว่าอะไรทำให้ image ใหญ่"},
    {group:"BUILD",cmd:"docker buildx build --platform linux/amd64 -t registry.example.com/shop/order-api:1.4.2 --push .",desc:"build ให้ server x86 จากเครื่อง Mac (ARM) แล้ว push เลย"},
  ],
  db2:[
    {group:'CONNECT',cmd:'db2 connect to SHOPDB user appuser',desc:'ต่อ database (CLP ถามรหัสผ่าน)'},
    {group:'CONNECT',cmd:'db2 list db directory',desc:'database ที่ catalog ไว้ในเครื่อง'},
    {group:'CONNECT',cmd:'db2 catalog tcpip node DEVNODE remote 10.0.0.5 server 50000',desc:'ลงทะเบียนเครื่อง DB ปลายทาง'},
    {group:'CONNECT',cmd:'db2 catalog db SHOPDB as SHOPDEV at node DEVNODE',desc:'ลงทะเบียน database บน node นั้นด้วยชื่อ alias'},
    {group:'CONNECT',cmd:'db2 terminate',desc:'ปิด connection และ CLP back-end process'},
    {group:'QUERY',cmd:'db2 list tables for schema SHOP',desc:'รายชื่อตารางใน schema'},
    {group:'QUERY',cmd:'db2 describe table SHOP.EMPLOYEE',desc:'คอลัมน์และชนิดข้อมูลของตาราง'},
    {group:'QUERY',cmd:'db2 -tvf script.sql',desc:'รันไฟล์ SQL (-t ใช้ ; คั่นคำสั่ง, -v แสดงคำสั่ง, -f จากไฟล์)'},
    {group:'QUERY',cmd:'db2 "SELECT COUNT(*) FROM SHOP.EMPLOYEE"',desc:'รัน SQL บรรทัดเดียว (ใส่ quote กัน shell ตีความ *)'},
    {group:'QUERY',cmd:'db2 "VALUES CURRENT SCHEMA"',desc:'ดู schema ปัจจุบัน'},
    {group:'DDL / ข้อมูล',cmd:'db2look -d SHOPDB -z SHOP -e -o ddl.sql',desc:'export DDL ของทั้ง schema ออกเป็นไฟล์'},
    {group:'DDL / ข้อมูล',cmd:'db2 "EXPORT TO emp.del OF DEL SELECT * FROM SHOP.EMPLOYEE"',desc:'export ข้อมูลเป็นไฟล์ delimited'},
    {group:'DDL / ข้อมูล',cmd:'db2 "IMPORT FROM emp.del OF DEL INSERT INTO SHOP.EMPLOYEE"',desc:'import ข้อมูล (ผ่าน log ทีละแถว เหมาะกับข้อมูลไม่ใหญ่)'},
    {group:'DDL / ข้อมูล',cmd:'db2 "LOAD FROM emp.del OF DEL INSERT INTO SHOP.EMPLOYEE NONRECOVERABLE"',desc:'load ข้อมูลใหญ่แบบเร็ว (ข้าม log) ตารางอาจค้าง set integrity pending'},
    {group:'ดูแลตาราง',cmd:"db2 \"CALL SYSPROC.ADMIN_CMD('REORG TABLE SHOP.EMPLOYEE')\"",desc:'จัดเรียงตารางใหม่ แก้ reorg pending (SQLCODE -668)'},
    {group:'ดูแลตาราง',cmd:'db2 "RUNSTATS ON TABLE SHOP.EMPLOYEE WITH DISTRIBUTION AND INDEXES ALL"',desc:'อัปเดตสถิติให้ optimizer เลือก plan ได้ดี'},
    {group:'ดูแลตาราง',cmd:'db2 "SET INTEGRITY FOR SHOP.EMPLOYEE IMMEDIATE CHECKED"',desc:'ปลดสถานะ check pending หลัง LOAD'},
    {group:'ระบบ / lock',cmd:'db2 list applications show detail',desc:'session ที่ต่ออยู่ พร้อม application handle'},
    {group:'ระบบ / lock',cmd:'db2 "FORCE APPLICATION (1234)"',desc:'ตัด session ตาม handle (transaction ของ session นั้น rollback)'},
    {group:'ระบบ / lock',cmd:'db2pd -d SHOPDB -locks wait',desc:'ดู lock ที่กำลังรอกันอยู่'},
    {group:'ระบบ / lock',cmd:'db2 get db cfg for SHOPDB | grep -i -E "LOCKTIMEOUT|LOGFILSIZ|LOGPRIMARY"',desc:'ดูค่า config ของ database ที่เกี่ยวกับ lock / log'},
    {group:'ระบบ / lock',cmd:'db2level',desc:'เวอร์ชันและ fix pack ของ DB2'},
  ],
  maven:[
    {group:'BUILD',cmd:'mvn clean install -DskipTests',desc:'build ทุก module และติดตั้งลง ~/.m2 โดยข้าม test'},
    {group:'BUILD',cmd:'mvn clean package -pl order-api -am',desc:'build เฉพาะ module นี้ พร้อม module ที่มันพึ่ง (-am)'},
    {group:'BUILD',cmd:'mvn -U clean install',desc:'บังคับโหลด snapshot / release ใหม่จาก repository'},
    {group:'BUILD',cmd:'mvn -o package',desc:'build แบบ offline ใช้ของใน ~/.m2'},
    {group:'BUILD',cmd:'mvn -T 1C clean install',desc:'build หลาย module ขนานกัน (1 thread ต่อ core)'},
    {group:'QUARKUS',cmd:'mvn quarkus:dev -Dquarkus.profile=local',desc:'รัน dev mode (hot reload) ด้วย profile local'},
    {group:'QUARKUS',cmd:'mvn package -Dquarkus.package.jar.type=uber-jar',desc:'รวมเป็น jar ไฟล์เดียว'},
    {group:'QUARKUS',cmd:'mvn package -Dnative -Dquarkus.native.container-build=true',desc:'build native image โดยใช้ container (ไม่ต้องลง GraalVM)'},
    {group:'DEPENDENCY',cmd:'mvn dependency:tree -Dincludes=io.quarkus',desc:'ดูต้นไม้ dependency เฉพาะ groupId นี้ (หาเวอร์ชันชนกัน)'},
    {group:'DEPENDENCY',cmd:'mvn dependency:tree -Dverbose',desc:'แสดง dependency ที่ถูกตัดเพราะซ้ำ / conflict ด้วย'},
    {group:'DEPENDENCY',cmd:'mvn versions:display-dependency-updates',desc:'ดู dependency ที่มีเวอร์ชันใหม่กว่า'},
    {group:'DEPENDENCY',cmd:'mvn help:effective-pom',desc:'pom จริงหลังรวม parent / profile แล้ว'},
    {group:'DEPENDENCY',cmd:'mvn dependency:purge-local-repository -DmanualInclude=com.example.platform',desc:'ลบ artifact นี้จาก ~/.m2 แล้วโหลดใหม่'},
    {group:'TEST / DEBUG',cmd:'mvn test -Dtest=OrderServiceTest#create',desc:'รัน test เฉพาะ class / method'},
    {group:'TEST / DEBUG',cmd:'mvn -X clean install',desc:'แสดง debug log ของ Maven (หาสาเหตุ build พัง)'},
    {group:'TEST / DEBUG',cmd:'mvn versions:set -DnewVersion=1.5.0 -DgenerateBackupPoms=false',desc:'เปลี่ยนเวอร์ชันทุก module พร้อมกัน'},
  ],
  pnpm:[
    {group:'INSTALL',cmd:'pnpm install',desc:'ติดตั้ง dependency ตาม pnpm-lock.yaml'},
    {group:'INSTALL',cmd:'pnpm install --frozen-lockfile',desc:'ติดตั้งโดยห้ามแก้ lockfile (ใช้ใน CI / Docker)'},
    {group:'INSTALL',cmd:'pnpm add @acme/ui-kit@10.0.0',desc:'เพิ่ม dependency พร้อมเวอร์ชัน'},
    {group:'INSTALL',cmd:'pnpm add -D @types/node',desc:'เพิ่ม devDependency'},
    {group:'INSTALL',cmd:'pnpm remove lodash',desc:'ถอด dependency'},
    {group:'WORKSPACE',cmd:'pnpm --filter web start',desc:'รัน script ของ package เดียวใน workspace'},
    {group:'WORKSPACE',cmd:'pnpm -r run build',desc:'รัน build ทุก package ใน workspace'},
    {group:'WORKSPACE',cmd:'pnpm why rxjs',desc:'ดูว่า package นี้ถูกดึงมาเพราะใคร'},
    {group:'WORKSPACE',cmd:'pnpm outdated',desc:'dependency ที่มีเวอร์ชันใหม่กว่า'},
    {group:'REGISTRY',cmd:'pnpm config get registry',desc:'ดู registry ที่ใช้อยู่'},
    {group:'REGISTRY',cmd:'pnpm login --registry=https://nexus.example.com/repository/npm-private/',desc:'login registry ส่วนตัว (เช่น nexus สำหรับ @acme/*)'},
    {group:'REGISTRY',cmd:'pnpm store prune',desc:'ล้าง package ที่ไม่ได้ใช้ออกจาก store'},
    {group:'RUN',cmd:'pnpm dlx @angular/cli@18 new demo',desc:'รัน CLI ชั่วคราวโดยไม่ติดตั้งถาวร (เหมือน npx)'},
    {group:'RUN',cmd:'pnpm ng serve --proxy-config proxy.conf-local.json --port 4201',desc:'รัน Angular dev server ผ่าน proxy ไป API local'},
  ],
};
const CLI_LABELS=[['docker','Docker'],['db2','DB2 CLP'],['maven','Maven'],['pnpm','pnpm']];
let _cliSet='docker';
function cliInit(){
  const seg=document.getElementById('cli-sets');
  if(seg&&!seg.children.length)seg.innerHTML=CLI_LABELS.map(([k,l])=>`<button type="button" class="json-view-btn" data-k="${k}" aria-pressed="false" onclick="cliSet('${k}')">${l}</button>`).join('');
  cliSet(_cliSet);
}
function cliSet(k){
  _cliSet=k;
  document.querySelectorAll('#cli-sets .json-view-btn').forEach(b=>{const on=b.dataset.k===k;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  filterCli(document.getElementById('cli-search').value);
}
function filterCli(q){
  const query=(q||'').trim().toLowerCase(),all=CLI_SETS[_cliSet];
  const cmds=query?all.filter(c=>c.cmd.toLowerCase().includes(query)||c.desc.toLowerCase().includes(query)||c.group.toLowerCase().includes(query)):all;
  renderCmdList(cmds,'cli-list',query);
}
function clearCli(){document.getElementById('cli-search').value='';filterCli('');}

// ── LINUX FOLDERS (FHS) ── second view of the Linux tab, same card list
const LINUX_FHS=[
  {group:'ระบบหลัก',cmd:'/',desc:'root ของทุกอย่าง ทุก path เริ่มจากตรงนี้'},
  {group:'ระบบหลัก',cmd:'/bin  /usr/bin',desc:'โปรแกรมที่ผู้ใช้ทั่วไปเรียกได้ (ls, cp, grep) ระบบใหม่ /bin ลิงก์ไป /usr/bin'},
  {group:'ระบบหลัก',cmd:'/sbin  /usr/sbin',desc:'โปรแกรมดูแลระบบสำหรับ root (ip, fdisk, reboot)'},
  {group:'ระบบหลัก',cmd:'/lib  /usr/lib',desc:'shared library ที่โปรแกรมใน bin ใช้'},
  {group:'ระบบหลัก',cmd:'/usr/local',desc:'โปรแกรมที่เราติดตั้งเองนอก package manager (ไม่โดนทับตอนอัปเดตระบบ)'},
  {group:'ระบบหลัก',cmd:'/opt',desc:'ซอฟต์แวร์ที่ติดตั้งเป็นก้อน เช่น /opt/ibm/db2, /opt/jdk, แอปของบริษัท'},
  {group:'ระบบหลัก',cmd:'/boot',desc:'kernel และ bootloader อย่าลบไฟล์ในนี้'},
  {group:'Config',cmd:'/etc',desc:'ไฟล์ config ของทั้งระบบ (ข้อความล้วน แก้ด้วย editor)'},
  {group:'Config',cmd:'/etc/hosts',desc:'จับคู่ชื่อเครื่องกับ IP เอง ใช้ก่อน DNS'},
  {group:'Config',cmd:'/etc/resolv.conf',desc:'DNS server ที่เครื่องใช้'},
  {group:'Config',cmd:'/etc/passwd  /etc/group',desc:'รายชื่อ user และ group (รหัสผ่านอยู่ใน /etc/shadow)'},
  {group:'Config',cmd:'/etc/fstab',desc:'ดิสก์ / share ที่ mount อัตโนมัติตอนบูต'},
  {group:'Config',cmd:'/etc/systemd/system',desc:'service ที่เราสร้างเอง (*.service) ใช้กับ systemctl'},
  {group:'Config',cmd:'/etc/nginx',desc:'config ของ nginx (nginx.conf, conf.d/*.conf)'},
  {group:'Config',cmd:'/etc/crontab  /etc/cron.d',desc:'งานตั้งเวลาระดับระบบ (ของ user ใช้ crontab -e)'},
  {group:'Config',cmd:'/etc/ssl/certs',desc:'certificate ของ CA ที่เครื่องเชื่อถือ'},
  {group:'ข้อมูลที่เปลี่ยนตลอด',cmd:'/var/log',desc:'log ของระบบและ service (syslog / messages, nginx/, journal/)'},
  {group:'ข้อมูลที่เปลี่ยนตลอด',cmd:'/var/lib',desc:'ข้อมูลของ service เช่น /var/lib/docker, /var/lib/mysql'},
  {group:'ข้อมูลที่เปลี่ยนตลอด',cmd:'/var/tmp',desc:'ไฟล์ชั่วคราวที่อยู่รอดหลัง reboot'},
  {group:'ข้อมูลที่เปลี่ยนตลอด',cmd:'/tmp',desc:'ไฟล์ชั่วคราว ลบได้ทุกเมื่อ หลายระบบล้างตอน reboot'},
  {group:'ข้อมูลที่เปลี่ยนตลอด',cmd:'/var/spool',desc:'คิวงานที่รอทำ เช่น mail, print, cron'},
  {group:'ข้อมูลที่เปลี่ยนตลอด',cmd:'/run',desc:'ไฟล์ของ process ที่กำลังรัน (pid, socket) หายเมื่อ reboot'},
  {group:'ผู้ใช้',cmd:'/home/<user>',desc:'ไฟล์ส่วนตัวของแต่ละ user'},
  {group:'ผู้ใช้',cmd:'/root',desc:'home ของ root (ไม่ได้อยู่ใน /home)'},
  {group:'ผู้ใช้',cmd:'~/.ssh',desc:'key และ known_hosts ของ SSH ต้องสิทธิ์ 700 ไม่งั้น ssh ไม่ยอมใช้'},
  {group:'ผู้ใช้',cmd:'~/.bashrc  ~/.profile',desc:'ตั้ง alias / PATH / env ตอนเปิด shell'},
  {group:'อุปกรณ์และ kernel',cmd:'/dev',desc:'อุปกรณ์ในรูปไฟล์ เช่น /dev/sda, /dev/null'},
  {group:'อุปกรณ์และ kernel',cmd:'/proc',desc:'ข้อมูล process และ kernel แบบ real-time (ไม่มีอยู่บนดิสก์จริง)'},
  {group:'อุปกรณ์และ kernel',cmd:'/proc/cpuinfo  /proc/meminfo',desc:'ข้อมูล CPU และ memory ของเครื่อง'},
  {group:'อุปกรณ์และ kernel',cmd:'/sys',desc:'ข้อมูลอุปกรณ์และ driver จาก kernel (cgroup ของ container อยู่ใต้ /sys/fs/cgroup)'},
  {group:'อุปกรณ์และ kernel',cmd:'/mnt  /media',desc:'จุด mount ชั่วคราว / อุปกรณ์ถอดได้'},
  {group:'อุปกรณ์และ kernel',cmd:'/srv',desc:'ข้อมูลที่เครื่องนี้ให้บริการ (บางที่ใช้วางเว็บ / ไฟล์แชร์)'},
];
let _linuxView='cmd';
function linuxView(v){
  _linuxView=v;
  document.querySelectorAll('#linux-view .json-view-btn').forEach(b=>{const on=b.dataset.v===v;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  const s=document.getElementById('linux-search');
  s.placeholder=v==='cmd'?'ค้นหาคำสั่ง... เช่น find, grep, service, port, network':'ค้นหาโฟลเดอร์... เช่น log, config, nginx, ssh';
  filterLinux(s.value);
}
