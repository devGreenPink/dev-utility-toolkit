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
      card.tabIndex=0;card.setAttribute('role','button');card.title='คลิกเพื่อ copy';
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
      const copyBtn=document.createElement('button');copyBtn.className='btn btn-ghost';copyBtn.textContent='Copy';
      copyBtn.onclick=e=>{e.stopPropagation();copyText(item.cmd);};
      card.onclick=()=>copyText(item.cmd);
      card.onkeydown=e=>{
        if(!isActivateKey(e))return;
        e.preventDefault();
        copyText(item.cmd);
      };
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
  const cmds=query?LINUX_CMDS.filter(c=>c.cmd.toLowerCase().includes(query)||c.desc.toLowerCase().includes(query)||c.group.toLowerCase().includes(query)):LINUX_CMDS;
  renderCmdList(cmds,'linux-list',query);
}
function clearLinux(){document.getElementById('linux-search').value='';renderCmdList(LINUX_CMDS,'linux-list','');}

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
  {group:'BASIC',cmd:'git add -p',desc:'เลือก stage ทีละ hunk — ควบคุมได้ละเอียดกว่า git add .'},
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
  {group:'REMOTE',cmd:'git pull --rebase',desc:'pull แบบ rebase — ไม่สร้าง merge commit เพิ่มเติม'},
  {group:'REMOTE',cmd:'git push -u origin <branch>',desc:'push และ set upstream ครั้งแรก'},
  {group:'REMOTE',cmd:'git push',desc:'push branch ปัจจุบันไป remote'},
  {group:'REMOTE',cmd:'git push --force-with-lease',desc:'force push แบบ safe — ยกเลิกถ้ามีคนอื่น push ก่อน'},
  {group:'REMOTE',cmd:'git push origin --delete <branch>',desc:'ลบ branch บน remote'},
  // UNDO / RESET
  {group:'UNDO / RESET',cmd:'git restore <file>',desc:'ยกเลิก unstaged changes ของไฟล์นั้น'},
  {group:'UNDO / RESET',cmd:'git restore --staged <file>',desc:'unstage ไฟล์ (เก็บการเปลี่ยนแปลงไว้)'},
  {group:'UNDO / RESET',cmd:'git revert <hash>',desc:'undo commit โดยสร้าง commit ใหม่ — safe สำหรับ shared branch'},
  {group:'UNDO / RESET',cmd:'git reset --soft HEAD~1',desc:'ย้อน 1 commit กลับมา staging area (เก็บ changes)'},
  {group:'UNDO / RESET',cmd:'git reset --mixed HEAD~1',desc:'ย้อน 1 commit กลับมา working tree (unstaged)'},
  {group:'UNDO / RESET',cmd:'git reset --hard HEAD~1',desc:'⚠️ ย้อน 1 commit และทิ้งการเปลี่ยนแปลงทั้งหมด'},
  {group:'UNDO / RESET',cmd:'git clean -fd',desc:'⚠️ ลบไฟล์ untracked ทั้งหมด (-f force, -d รวม directory)'},
  {group:'UNDO / RESET',cmd:'git reflog',desc:'ดู history ทุกการเคลื่อนไหวของ HEAD — ใช้กู้คืน commit ที่หายไป'},
  // STASH
  {group:'STASH',cmd:'git stash push -m "wip: xxx"',desc:'บันทึก work-in-progress ชั่วคราวพร้อม message'},
  {group:'STASH',cmd:'git stash list',desc:'แสดง stash ทั้งหมด'},
  {group:'STASH',cmd:'git stash pop',desc:'คืนค่า stash ล่าสุดแล้วลบ stash นั้น'},
  {group:'STASH',cmd:'git stash apply stash@{1}',desc:'คืนค่า stash ที่ระบุโดยไม่ลบ'},
  {group:'STASH',cmd:'git stash drop stash@{0}',desc:'ลบ stash ที่ระบุ'},
  {group:'STASH',cmd:'git stash clear',desc:'ลบ stash ทั้งหมด'},
  {group:'STASH',cmd:'git stash push --include-untracked',desc:'stash รวม untracked files ด้วย'},
  // REBASE
  {group:'REBASE',cmd:'git rebase main',desc:'rebase branch ปัจจุบันบน main — ทำ history เป็นเส้นตรง'},
  {group:'REBASE',cmd:'git rebase -i HEAD~3',desc:'interactive rebase 3 commit ล่าสุด — squash / reorder / edit'},
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
