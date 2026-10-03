// ── SQL PARSER ──
function unescapeJava(s){return s.replace(/\\\\/g,'\x00BS\x00').replace(/\\n/g,'\n').replace(/\\t/g,'\t').replace(/\\r/g,'\r').replace(/\\"/g,'"').replace(/\\'/g,"'").replace(/\x00BS\x00/g,'\\');}
function extractStringLiterals(expr){const re=/"((?:[^"\\]|\\.)*)"/g;const parts=[];let m;while((m=re.exec(expr))!==null)parts.push(unescapeJava(m[1]));return parts.join('');}
const SQL_MODES={
  TEXTBLOCK:{label:'Text Block (Java 15+)',color:'#a78bfa'},
  APPEND:{label:'StringBuilder / append()',color:'#34d399'},
  CONCAT:{label:'String concat (+)',color:'#60a5fa'},
  MYBATIS:{label:'MyBatis / JPA (#{} / :param)',color:'#fbbf24'},
  ANNOTATION:{label:'@Query / prepareStatement',color:'#f472b6'},
  STRFORMAT:{label:'String.format()',color:'#fb923c'},
  MYBATIS_XML:{label:'MyBatis XML mapper',color:'#4ade80'},
  PLAIN:{label:'Plain SQL',color:'#94a3b8'},
};
function detectMode(input){
  if(/"""[\s\S]*?"""/.test(input)) return 'TEXTBLOCK';
  if(/<(?:select|insert|update|delete)[^>]*>[\s\S]*?<\/(?:select|insert|update|delete)>/i.test(input)) return 'MYBATIS_XML';
  if(/@Query\s*\(|\.(?:prepareStatement|queryForObject|queryForList|queryForMap)\s*\(/.test(input)) return 'ANNOTATION';
  if(/String\.format\s*\(/.test(input)) return 'STRFORMAT';
  if(/\.append\s*\(|new\s+(?:String(?:Builder|Buffer))\s*\(/.test(input)) return 'APPEND';
  if(/"[^"]*"\s*\+|\+=\s*"/.test(input)) return 'CONCAT';
  const noStrings=input.replace(/"(?:[^"\\]|\\.)*"/g,'""');
  if(/#\{[\w.]+\}/.test(noStrings)) return 'MYBATIS';
  if(/(?<![:/]):\b[a-zA-Z_]\w*\b/.test(noStrings)) return 'MYBATIS';
  return 'PLAIN';
}
function detectSqlMode(val){
  const badge=document.getElementById('sql-detect-badge');
  if(!val.trim()){badge.textContent='—';badge.style.color='var(--text-dim)';badge.style.borderColor='var(--border)';return;}
  const mode=detectMode(val);const info=SQL_MODES[mode];
  badge.textContent=info.label;badge.style.color=info.color;badge.style.borderColor=info.color+'66';
}
function _skipSqlLine(t){
  if(!t) return true;
  if(/^\s*(?:\/\/|\/\*|\*)/.test(t)) return true;
  if(/\b(?:conditions|params|criteria|paramMap|conditionMap)\s*\.(?:put|add|set|remove)\s*\(/.test(t)) return true;
  if(/^\s*(?:Map|HashMap|TreeMap|LinkedHashMap|List|ArrayList)\s*[<\s{]/.test(t)) return true;
  if(/^\s*(?:if|else|for|while|try|catch|finally|return|throw)\b/.test(t)) return true;
  if(/\b(?:log|logger|LOG|LOGGER)\s*\.|System\.out\./.test(t)) return true;
  if(/^\s*\{?\s*$|^\s*\}\s*$/.test(t)) return true;
  return false;
}
function parseAppend(block){
  const parts=[];
  for(const line of block.split('\n')){
    const t=line.trim();
    if(_skipSqlLine(t)) continue;
    // Constructor with SQL: new StringBuilder("sql...") — extract from arg
    const ctorFull=t.match(/new\s+(?:String(?:Builder|Buffer))\s*\(([^)]*)\)/);
    if(ctorFull){if(ctorFull[1].trim()){const s=extractStringLiterals(ctorFull[1]);if(s)parts.push(s);}continue;}
    // Multi-line constructor (closing ) on next line)
    if(/new\s+(?:String(?:Builder|Buffer))\s*\(/.test(t)){const s=extractStringLiterals(t);if(s)parts.push(s);continue;}
    // .append("sql")
    const apM=t.match(/\.append\s*\(([\s\S]*?)\)\s*;?\s*(?:\/\/.*)?$/);
    if(apM){const s=extractStringLiterals(apM[1]);if(s)parts.push(s);continue;}
    // Continuation string: starts with "
    if(/^"/.test(t)){const s=extractStringLiterals(t);if(s)parts.push(s);continue;}
    // sql += "..."
    const plusM=t.match(/^\w+\s*\+=\s*(.*?)\s*;?\s*$/);
    if(plusM){const s=extractStringLiterals(plusM[1]);if(s)parts.push(s);continue;}
    // String sql = "..."
    const strM=t.match(/^(?:(?:final|static|private|public|protected)\s+)*String\s+\w+\s*=\s*(.*?)\s*;?\s*$/);
    if(strM){const s=extractStringLiterals(strM[1]);if(s)parts.push(s);}
  }
  return parts.join('');
}
function splitAppendBlocks(input){
  const lines=input.split('\n');const blocks=[];let cur=[];
  for(const line of lines){
    const t=line.trim();
    if(/(?:StringBuilder|StringBuffer)\s+\w+\s*=\s*new\s+(?:StringBuilder|StringBuffer)/.test(t)&&cur.some(l=>l.trim())){blocks.push(cur.join('\n'));cur=[];}
    cur.push(line);
  }
  if(cur.some(l=>l.trim())) blocks.push(cur.join('\n'));
  return blocks.length?blocks:[input];
}
function parseConcat(block){
  const cleaned=block.replace(/\/\/.*$/gm,'').replace(/\/\*[\s\S]*?\*\//g,'')
    .replace(/^\s*(?:(?:private|public|protected|static|final)\s+)*String\s+\w+\s*=\s*/m,'')
    .replace(/;\s*$/,'').replace(/\\\s*\n/g,'');
  return extractStringLiterals(cleaned);
}
function splitConcatBlocks(input){
  const lines=input.split('\n');const blocks=[];let cur=[];
  for(const line of lines){
    const t=line.trim();
    if(/^(?:(?:private|public|protected|static|final)\s+)*String\s+\w+\s*=\s*"/.test(t)&&cur.some(l=>l.trim())){blocks.push(cur.join('\n'));cur=[];}
    cur.push(line);
  }
  if(cur.some(l=>l.trim())) blocks.push(cur.join('\n'));
  return blocks.length?blocks:[input];
}
function parseTextBlockContent(raw){
  let s=raw.replace(/^\n/,'');
  const lines=s.split('\n');const nonEmpty=lines.filter(l=>l.trim().length>0);
  if(nonEmpty.length>0){const minIndent=Math.min(...nonEmpty.map(l=>l.match(/^(\s*)/)[1].length));if(minIndent>0)s=lines.map(l=>l.slice(minIndent)).join('\n');}
  return unescapeJava(s).trimEnd();
}
function parseAnnotationQuery(input){
  const qm=input.match(/@Query\s*\(\s*(?:value\s*=\s*)?"((?:[^"\\]|\\.)*)"/);
  if(qm) return unescapeJava(qm[1]);
  const pm=input.match(/\.(?:prepareStatement|query|queryForObject|queryForList|queryForMap|update|execute)\s*\(\s*"((?:[^"\\]|\\.)*)"/);
  if(pm) return unescapeJava(pm[1]);
  return '';
}
function parseStringFormat(input){
  const m=input.match(/String\.format\s*\(\s*"((?:[^"\\]|\\.)*)"/);
  if(!m) return '';
  return unescapeJava(m[1]).replace(/%[sdfnxo%]/g,'?');
}
function parsePlain(input){
  const stripped=input.replace(/\/\/.*$/gm,'').replace(/\/\*[\s\S]*?\*\//g,'').trim();
  const hasQuotes=/"/.test(stripped);
  return hasQuotes?(extractStringLiterals(stripped)||stripped):stripped;
}
const _FMT_NL=['ORDER\\s+BY','GROUP\\s+BY','LEFT\\s+OUTER\\s+JOIN','RIGHT\\s+OUTER\\s+JOIN','FULL\\s+OUTER\\s+JOIN','LEFT\\s+JOIN','RIGHT\\s+JOIN','INNER\\s+JOIN','CROSS\\s+JOIN','FULL\\s+JOIN','UNION\\s+ALL','INSERT\\s+INTO','DELETE\\s+FROM','SELECT','FROM','WHERE','HAVING','LIMIT','OFFSET','UNION','UPDATE','VALUES','WITH'];
const _FMT_KW=['DISTINCT','AS','AND','OR','NOT','IN','EXISTS','BETWEEN','LIKE','IS\\s+NOT\\s+NULL','IS\\s+NULL','NULL','CASE','WHEN','THEN','ELSE','END','ON','SET','INTO','BY','ASC','DESC','COUNT','SUM','AVG','MAX','MIN','COALESCE','NULLIF','CAST','CONVERT','TRIM','UPPER','LOWER','LENGTH','SUBSTRING','REPLACE','NVL','JOIN','LEFT','RIGHT','INNER','OUTER','FULL','CROSS','ALL'];
// ── SQL DBeaver-style Formatter ──
const _SQL_CLAUSE_KWS=[
  'LEFT OUTER JOIN','RIGHT OUTER JOIN','FULL OUTER JOIN',
  'LEFT JOIN','RIGHT JOIN','INNER JOIN','CROSS JOIN','FULL JOIN',
  'GROUP BY','ORDER BY','UNION ALL','INSERT INTO','DELETE FROM',
  'SELECT','FROM','WHERE','HAVING','LIMIT','OFFSET',
  'UNION','INTERSECT','EXCEPT','VALUES','SET','WITH','JOIN','UPDATE'
];
function _sqlSplitComma(str){
  const parts=[];let depth=0,cur='';
  for(const c of str){
    if(c==='('||c==='[')depth++;else if(c===')'||c===']')depth--;
    if(c===','&&depth===0){parts.push(cur.trim());cur='';}else cur+=c;
  }
  if(cur.trim())parts.push(cur.trim());
  return parts;
}
function _sqlSplitAndOr(str){
  const parts=[];let depth=0,cur='',i=0;const u=str.toUpperCase();
  while(i<str.length){
    const c=str[i];
    if(c==='('||c==='[')depth++;else if(c===')'||c===']')depth--;
    if(depth===0&&i>0&&/\s/.test(str[i-1])){
      if(u.startsWith('AND ',i)){if(cur.trim())parts.push(cur.trim());cur='AND ';i+=4;continue;}
      if(u.startsWith('OR ',i)){if(cur.trim())parts.push(cur.trim());cur='OR ';i+=3;continue;}
    }
    cur+=str[i];i++;
  }
  if(cur.trim())parts.push(cur.trim());
  return parts;
}
function _sqlFindOn(str){
  let depth=0;const u=str.toUpperCase();
  for(let i=0;i<str.length-3;i++){
    if(str[i]==='(')depth++;else if(str[i]===')')depth--;
    if(depth===0&&u.slice(i,i+4)===' ON ')return i;
  }
  return -1;
}
function _segmentSQL(sql){
  const s=sql.replace(/\s+/g,' ').trim();const u=s.toUpperCase();
  const segs=[];let cur='',curKw=null,i=0,depth=0;
  function matchKw(p){
    if(p>0&&!/[\s,)]/.test(s[p-1]))return null;
    for(const kw of _SQL_CLAUSE_KWS){
      if(u.startsWith(kw,p)){
        const nx=s[p+kw.length];
        if(!nx||/[\s(]/.test(nx))return kw;
      }
    }
    return null;
  }
  while(i<s.length){
    const c=s[i];
    if(c==='('||c==='[')depth++;else if(c===')'||c===']')depth--;
    if(depth===0){
      const kw=matchKw(i);
      if(kw){
        if(curKw||cur.trim())segs.push({kw:curKw,body:cur.trim()});
        curKw=kw;cur='';i+=kw.length;continue;
      }
    }
    cur+=c;i++;
  }
  if(curKw||cur.trim())segs.push({kw:curKw,body:cur.trim()});
  return segs;
}
function formatSQLDBeaver(rawSql){
  const IND='    ';
  const JOIN_KWS=new Set(['LEFT OUTER JOIN','RIGHT OUTER JOIN','FULL OUTER JOIN','LEFT JOIN','RIGHT JOIN','INNER JOIN','CROSS JOIN','FULL JOIN','JOIN']);
  const COMMA_KWS=new Set(['SELECT','GROUP BY','ORDER BY','SET','VALUES']);
  const ANDOR_KWS=new Set(['WHERE','HAVING']);
  let sql=rawSql.replace(/[\r\n\t]+/g,' ').replace(/ {2,}/g,' ').trim();
  const upPat=new RegExp('(?<![\\w\'"`])('+[..._FMT_NL,..._FMT_KW].join('|')+')(?![\\w\'"`])','gi');
  sql=sql.replace(upPat,(_,kw)=>kw.replace(/\s+/g,' ').toUpperCase());
  const segs=_segmentSQL(sql);
  const out=[];
  for(const {kw,body} of segs){
    if(!kw&&!body)continue;
    if(!kw){out.push(body);continue;}
    out.push(kw);
    if(!body)continue;
    if(COMMA_KWS.has(kw)){
      const items=_sqlSplitComma(body);
      items.forEach((item,idx)=>out.push(IND+item+(idx<items.length-1?',':'')));
    }else if(ANDOR_KWS.has(kw)){
      _sqlSplitAndOr(body).forEach(cond=>out.push(IND+cond));
    }else if(JOIN_KWS.has(kw)){
      const onIdx=_sqlFindOn(body);
      if(onIdx>-1){
        out.push(IND+body.slice(0,onIdx).trim());
        const onConds=_sqlSplitAndOr(body.slice(onIdx+4).trim());
        out.push(IND+'ON '+onConds[0]);
        for(let j=1;j<onConds.length;j++)out.push(IND+IND+onConds[j]);
      }else{
        out.push(IND+body);
      }
    }else{
      out.push(IND+body);
    }
  }
  return out.join('\n');
}
// ── SQL Highlighter ──
const _TBL_COLORS=['#60a5fa','#34d399','#f472b6','#fb923c','#a78bfa','#facc15','#22d3ee','#4ade80'];
const _SQL_RESERVED=new Set(['where','on','set','having','order','group','limit','offset','inner','left','right','cross','full','join','and','or','not','in','is','as','by','select','from','union','values','update','delete','insert','with','distinct','case','when','then','else','end']);
function analyzeSQL(sql){
  const aliasMap={};let m;
  const fromRe=/\bFROM\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?\b/gi;
  while((m=fromRe.exec(sql))!==null){
    const tbl=m[1].toLowerCase();const alias=(m[2]||m[1]).toLowerCase();
    if(!_SQL_RESERVED.has(alias))aliasMap[alias]=tbl;
  }
  const joinRe=/\b(?:(?:LEFT|RIGHT|INNER|CROSS|FULL)(?:\s+OUTER)?\s+)?JOIN\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?\b/gi;
  while((m=joinRe.exec(sql))!==null){
    const tbl=m[1].toLowerCase();const alias=(m[2]||m[1]).toLowerCase();
    if(!_SQL_RESERVED.has(alias))aliasMap[alias]=tbl;
  }
  const tableNames=[...new Set(Object.values(aliasMap))];
  const colorMap={};
  tableNames.forEach((t,i)=>{colorMap[t]=_TBL_COLORS[i%_TBL_COLORS.length];});
  // Detect duplicate column names across different tables
  const colsByName={};
  const colRe=/\b(\w+)\.(\w+)\b/g;
  while((m=colRe.exec(sql))!==null){
    const alias=m[1].toLowerCase();const col=m[2].toLowerCase();
    if(!aliasMap[alias])continue;
    if(!colsByName[col])colsByName[col]=new Set();
    colsByName[col].add(aliasMap[alias]);
  }
  const dupCols=new Set(Object.entries(colsByName).filter(([,ts])=>ts.size>1).map(([c])=>c));
  return{aliasMap,colorMap,tableNames,dupCols};
}
function highlightSQLHtml(sql,aliasMap,colorMap){
  let html=escHtml(sql);
  // Highlight table names after FROM / JOIN
  const tableNames=[...new Set(Object.values(aliasMap))].sort((a,b)=>b.length-a.length);
  for(const tbl of tableNames){
    const color=colorMap[tbl];
    const re=new RegExp('(\\bFROM\\s+|\\bJOIN\\s+)('+tbl+')\\b','gi');
    html=html.replace(re,(_,prefix,name)=>`${prefix}<span style="color:${color};font-weight:600;opacity:.75">${name}</span>`);
  }
  // Highlight alias.column
  const aliases=Object.keys(aliasMap).sort((a,b)=>b.length-a.length);
  for(const alias of aliases){
    const color=colorMap[aliasMap[alias]];
    const re=new RegExp('\\b('+alias+')\\.(\\w+)\\b','gi');
    html=html.replace(re,(_,a,col)=>`<span style="color:${color};font-weight:500">${a}.<span style="opacity:.8">${col}</span></span>`);
  }
  return html;
}
function convertSQL(){
  const input=document.getElementById('sql-input').value.trim();
  const errEl=document.getElementById('sql-error');errEl.classList.remove('visible');errEl.textContent='';
  const resultsEl=document.getElementById('sql-results');resultsEl.innerHTML='';
  if(!input){showSqlErr('กรุณาวาง Java code หรือ SQL ก่อน');return;}
  const doFormat=document.getElementById('sql-format-check').checked;
  const mode=detectMode(input);
  let sqls=[];
  try{
    switch(mode){
      case'TEXTBLOCK':{const re=/"""([\s\S]*?)"""/g;let m;while((m=re.exec(input))!==null){const s=parseTextBlockContent(m[1]);if(s.trim())sqls.push(s);}break;}
      case'APPEND':{for(const b of splitAppendBlocks(input)){const s=parseAppend(b);if(s.trim())sqls.push(s);}break;}
      case'CONCAT':{for(const b of splitConcatBlocks(input)){const s=parseConcat(b);if(s.trim())sqls.push(s);}break;}
      case'ANNOTATION':{const s=parseAnnotationQuery(input);if(s.trim())sqls.push(s);break;}
      case'STRFORMAT':{const s=parseStringFormat(input);if(s.trim())sqls.push(s);break;}
      case'MYBATIS_XML':{const re=/<(?:select|insert|update|delete)[^>]*>([\s\S]*?)<\/(?:select|insert|update|delete)>/gi;let m;while((m=re.exec(input))!==null){const s=m[1].trim();if(s)sqls.push(s);}break;}
      default:{const s=parsePlain(input);if(s.trim())sqls.push(s);}
    }
  }catch(e){showSqlErr('Parse error: '+e.message);return;}
  if(!sqls.length){showSqlErr('ไม่พบ SQL string ในโค้ด');return;}
  if(doFormat) sqls=sqls.map(formatSQLDBeaver);
  const multi=sqls.length>1;
  sqls.forEach((sql,i)=>{
    const{aliasMap,colorMap,tableNames,dupCols}=analyzeSQL(sql);
    const hasHighlight=tableNames.length>0;
    const card=document.createElement('div');card.className='sql-result-card';
    // Header
    const hdr=document.createElement('div');hdr.className='sql-result-header';
    const lbl=document.createElement('span');lbl.className='sql-result-label';lbl.textContent=multi?`SQL #${i+1}`:'SQL';
    hdr.appendChild(lbl);
    // Table legend
    if(hasHighlight){
      const legend=document.createElement('div');legend.className='sql-legend';
      tableNames.forEach(t=>{
        const item=document.createElement('span');item.className='sql-legend-item';
        item.innerHTML=`<span class="sql-legend-dot" style="background:${colorMap[t]}"></span>${escHtml(t)}`;
        legend.appendChild(item);
      });
      hdr.appendChild(legend);
    }
    const btn=document.createElement('button');btn.className='btn btn-ghost btn-sm';btn.textContent='📋 Copy';
    hdr.appendChild(btn);
    // Body
    const pre=document.createElement('pre');pre.className='sql-result-body';
    if(hasHighlight){pre.innerHTML=highlightSQLHtml(sql,aliasMap,colorMap);}
    else{pre.textContent=sql;}
    btn.onclick=()=>copyText(pre.textContent);
    card.appendChild(hdr);card.appendChild(pre);
    resultsEl.appendChild(card);
  });
}
function showSqlErr(msg){const el=document.getElementById('sql-error');el.textContent=msg;el.classList.add('visible');}
function clearSQL(){
  document.getElementById('sql-input').value='';
  document.getElementById('sql-results').innerHTML='';
  document.getElementById('sql-error').classList.remove('visible');
  document.getElementById('sql-detect-badge').textContent='—';
}
