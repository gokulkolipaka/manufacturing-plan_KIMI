/*  Graviti Production Planner – Single-File Edition v2.1  */

const { useState, useEffect, useRef } = React;

/* ------------- 1. DEFAULT DATA ------------- */
const DEFAULT_USERS = [
  { id: 1, username: 'superadmin', password: 'admin123', role: 'Super Admin', passwordChangeRequired: false },
  { id: 2, username: 'admin',      password: 'admin123', role: 'Admin',      passwordChangeRequired: false },
  { id: 3, username: 'user',       password: 'user123',  role: 'User',       passwordChangeRequired: false }
];

const INITIAL_DATA = [
  { id: 1, process: 'Granulation 150 L', 45835: 0, 45836: 0, 45837: 0, 45838: 0, 45839: 0, 45840: 12, 45841: 0, 45842: 0, 45843: 0, 45844: 0, 45845: 0, 45846: 0, 45847: 0, 45848: 0, total: 12 },
  { id: 2, process: 'Granulation 700 L', 45835: 2, 45836: 6.1, 45837: 0, 45838: 6.1, 45839: 6.1, 45840: 4.1, 45841: 6.1, 45842: 4.15, 45843: 2.05, 45844: 0, 45845: 2.55, 45846: 20.7, 45847: 16.4, 45848: 6.4, total: 82.65 },
  { id: 3, process: 'Granulation 1400 L', 45835: 0, 45836: 0, 45837: 0, 45838: 0, 45839: 0, 45840: 0, 45841: 0, 45842: 0, 45843: 0, 45844: 0, 45845: 0, 45846: 0, 45847: 0, 45848: 0, total: 0 },
  { id: 4, process: 'Granulation 1200 L', 45835: 0, 45836: 0, 45837: 0, 45838: 0, 45839: 0, 45840: 0, 45841: 0, 45842: 0, 45843: 0, 45844: 0, 45845: 0, 45846: 0, 45847: 0, 45848: 0, total: 0 },
  { id: 5, process: 'FBP total', 45835: 12, 45836: 12, 45837: 0, 45838: 12, 45839: 12, 45840: 8.2, 45841: 12, 45842: 8.3, 45843: 4.1, 45844: 0, 45845: 5.1, 45846: 41.4, 45847: 32.8, 45848: 12.8, total: 194.65 }
];

const DEFAULT_COLUMNS = ['45835','45836','45837','45838','45839','45840','45841','45842','45843','45844','45845','45846','45847','45848'];

const EXCIPIENTS = ['Binders','Disintegrants','Lubricants','Coatings','Fillers','Glidants','Colourants','Flavouring Agents'];

/* ------------- 2. HELPERS ------------- */
const generateId = () => Date.now() + Math.random();
const validatePassword = pw => {
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /[a-z]/.test(pw), /\d/.test(pw), /[!@#$%^&*(),.?":{}|<>]/.test(pw)].filter(Boolean).length;
  if (score < 3) return { valid: false, strength: 'weak' };
  if (score < 5) return { valid: true, strength: 'medium' };
  return { valid: true, strength: 'strong' };
};

function addAuditLog(action, details, user) {
  try {
    const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    logs.unshift({ id: generateId(), ts: new Date().toISOString(), user: user?.username || 'Unknown', action, details });
    localStorage.setItem('auditLogs', JSON.stringify(logs.slice(0, 100)));
  } catch {}
}

/* ------------- 3. INIT ------------- */
function initStorage() {
  if (!localStorage.users)            localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
  if (!localStorage.manufacturingData)localStorage.setItem('manufacturingData', JSON.stringify(INITIAL_DATA));
  if (!localStorage.columnHeaders)    localStorage.setItem('columnHeaders', JSON.stringify(DEFAULT_COLUMNS));
  if (!localStorage.companyLogo)      localStorage.setItem('companyLogo', 'https://via.placeholder.com/170x66');
  if (!localStorage.warehouseStock)   localStorage.setItem('warehouseStock', JSON.stringify({}));
  if (!localStorage.procurementPlan)  localStorage.setItem('procurementPlan', JSON.stringify({}));
}
initStorage();

/* ------------- 4. LOGIN ------------- */
function LoginPage({ onLogin }) {
  const [u,setU]=useState(''); const [p,setP]=useState(''); const [err,setErr]=useState('');
  const [signup,setSignup]=useState(false);
  const [logo,setLogo]=useState(localStorage.getItem('companyLogo'));
  const handle=e=>{
    e.preventDefault();
    const users=JSON.parse(localStorage.users||'[]');
    if (signup){
      if (users.find(x=>x.username===u)) return setErr('Username exists');
      const newUser={id:generateId(),username:u,password:p,role:'User',passwordChangeRequired:true};
      users.push(newUser);
      localStorage.users=JSON.stringify(users);
      addAuditLog('SIGNUP',`New user ${u}`,newUser);
      return onLogin(newUser);
    }
    const user=users.find(x=>x.username===u && x.password===p);
    if (user){addAuditLog('LOGIN',`User ${u} logged in`,user); onLogin(user);}
    else setErr('Invalid credentials');
  };
  const logoUpload=e=>{
    const file=e.target.files[0];
    if(file){
      const reader=new FileReader();
      reader.onload=ev=>{localStorage.companyLogo=ev.target.result; setLogo(ev.target.result);};
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="login-container">
      <form onSubmit={handle} className="login-form">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
          <div className="company-name">Graviti Pharmaceuticals</div>
          <div className="app-title">Manufacturing Planner</div>
        </div>
        <div className="form-group"><label>Username</label><input value={u} onChange={e=>setU(e.target.value)} required/></div>
        <div className="form-group"><label>Password</label><input type="password" value={p} onChange={e=>setP(e.target.value)} required/></div>
        {signup&&<div className="form-group"><label>Upload Logo (optional)</label><input type="file" accept="image/*" onChange={logoUpload}/></div>}
        <button className="login-btn">{signup?'Sign Up':'Login'}</button>
        {err&&<div className="error-message">{err}</div>}
        <div style={{textAlign:'center',marginTop:10}}>
          <button type="button" className="link-btn" onClick={()=>{setSignup(!signup);setErr('');setU('');setP('');}}>
            {signup?'Already have an account? Login':'Need an account? Sign Up'}
          </button>
        </div>
        <div className="demo-note">Demo: superadmin/admin123 | admin/admin123 | user/user123</div>
      </form>
    </div>
  );
}

/* ------------- 5. PASSWORD CHANGE ------------- */
function PasswordChangeModal({user,onDone}){
  const [np,setNp]=useState('');const[cp,setCp]=useState('');const[err,setErr]=useState('');
  const val=validatePassword(np);
  const save=e=>{
    e.preventDefault();
    if(np!==cp)return setErr('Passwords do not match');
    if(!val.valid)return setErr('Password too weak');
    const users=JSON.parse(localStorage.users);
    const idx=users.findIndex(x=>x.id===user.id);
    users[idx].password=np;users[idx].passwordChangeRequired=false;
    localStorage.users=JSON.stringify(users);
    addAuditLog('PASSWORD_CHANGE','Password changed',user);
    onDone(users[idx]);
  };
  return(
    <div className="modal-overlay">
      <div className="modal password-change-modal">
        <h3>Change Password</h3>
        <p>You must change your password before continuing.</p>
        <form onSubmit={save}>
          <label>New Password</label>
          <input type="password" value={np} onChange={e=>setNp(e.target.value)} required/>
          {np&&<div className={`password-strength strength-${val.strength}`}>Strength: {val.strength.toUpperCase()}</div>}
          <div className="password-requirements">8+ chars, upper, lower, number, special</div>
          <label>Confirm</label>
          <input type="password" value={cp} onChange={e=>setCp(e.target.value)} required/>
          {err&&<div className="error-message">{err}</div>}
          <button className="control-btn primary-btn">Save</button>
        </form>
      </div>
    </div>
  );
}

/* ------------- 6. USER MANAGEMENT ------------- */
function UserManagementModal({currentUser,close}){
  const [users,setUsers]=useState(JSON.parse(localStorage.users||'[]'));
  const [showAdd,setShowAdd]=useState(false);
  const [newU,setNewU]=useState({username:'',password:'temp123',role:'User'});
  const [del,setDel]=useState(null);
  const add=e=>{
    e.preventDefault();
    if(users.find(x=>x.username===newU.username))return alert('Exists');
    const u={id:generateId(),...newU,passwordChangeRequired:true};
    setUsers([...users,u]);
    localStorage.users=JSON.stringify([...users,u]);
    addAuditLog('ADD_USER',`Added ${newU.username}`,currentUser);
    setShowAdd(false);setNewU({username:'',password:'temp123',role:'User'});
  };
  const remove=id=>{
    const name=users.find(x=>x.id===id).username;
    const filtered=users.filter(x=>x.id!==id);
    setUsers(filtered);
    localStorage.users=JSON.stringify(filtered);
    addAuditLog('DELETE_USER',`Deleted ${name}`,currentUser);
    setDel(null);
  };
  return(
    <div className="modal-overlay">
      <div className="modal" style={{maxWidth:600}}>
        <div className="modal-header"><h3>User Management</h3><button className="modal-close" onClick={close}>&times;</button></div>
        <div className="modal-body">
          <div className="flex justify-between items-center mb-2">
            <h4>Current Users</h4>
            <button className="control-btn primary-btn" onClick={()=>setShowAdd(true)}><i className="fas fa-plus"></i> Add User</button>
          </div>
          <table className="user-table">
            <thead><tr><th>Username</th><th>Role</th><th>Status</th><th/></tr></thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>{u.passwordChangeRequired?<span className="status status--warning">Change Required</span>:<span className="status status--success">Active</span>}</td>
                  <td>{u.id!==currentUser.id&&<button className="action-btn delete-btn" onClick={()=>setDel(u.id)}><i className="fas fa-trash"/></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {showAdd&&(
            <form onSubmit={add} style={{marginTop:20,padding:15,border:'1px solid var(--color-border)',borderRadius:8}}>
              <h5>Add User</h5>
              <div className="form-group"><label>Username</label><input className="form-input" value={newU.username} onChange={e=>setNewU({...newU,username:e.target.value})} required/></div>
              <div className="form-group"><label>Role</label>
                <select className="form-control" value={newU.role} onChange={e=>setNewU({...newU,role:e.target.value})}>
                  <option>User</option><option>Admin</option>{currentUser.role==='Super Admin'&&<option>Super Admin</option>}
                </select>
              </div>
              <div className="flex gap-2"><button type="submit" className="control-btn primary-btn">Add</button><button type="button" className="control-btn" onClick={()=>setShowAdd(false)}>Cancel</button></div>
            </form>
          )}
          {del&&(
            <div className="modal-overlay">
              <div className="modal" style={{maxWidth:400}}>
                <h3>Confirm Delete</h3><p>Delete this user?</p>
                <div className="modal-footer"><button className="control-btn danger-btn" onClick={()=>remove(del)}>Delete</button><button className="control-btn" onClick={()=>setDel(null)}>Cancel</button></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------- 7. WAREHOUSE STOCK ------------- */
function WarehouseModal({close}){
  const [stock,setStock]=useState(JSON.parse(localStorage.warehouseStock||'{}'));
  const save=()=>{localStorage.warehouseStock=JSON.stringify(stock); addAuditLog('STOCK_UPDATE','Warehouse updated',null); close();};
  return(
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header"><h3>Warehouse Stock</h3><button className="modal-close" onClick={close}>&times;</button></div>
        <div className="modal-body">
          <table className="user-table">
            <thead><tr><th>Material</th><th>Stock (kg)</th></tr></thead>
            <tbody>
              {Object.entries(stock).map(([m,q])=>(
                <tr key={m}>
                  <td>{m}</td>
                  <td><input type="number" className="cell-input" value={q} onChange={e=>setStock({...stock,[m]:+e.target.value})}/></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="modal-footer"><button className="control-btn primary-btn" onClick={()=>{const m=prompt('Material name');if(m)setStock({...stock,[m]:0})}}>Add Material</button><button className="control-btn" onClick={save}>Save</button></div>
        </div>
      </div>
    </div>
  );
}

/* ------------- 8. PROCUREMENT PLAN ------------- */
function ProcurementModal({close}){
  const [plan,setPlan]=useState(JSON.parse(localStorage.procurementPlan||'{}'));
  const save=()=>{localStorage.procurementPlan=JSON.stringify(plan); addAuditLog('PROCUREMENT_UPDATE','Plan updated',null); close();};
  return(
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header"><h3>Monthly Procurement Plan</h3><button className="modal-close" onClick={close}>&times;</button></div>
        <div className="modal-body">
          <table className="user-table">
            <thead><tr><th>Product</th><th>Qty (k units)</th></tr></thead>
            <tbody>
              {Object.entries(plan).map(([p,q])=>(
                <tr key={p}>
                  <td>{p}</td>
                  <td><input type="number" className="cell-input" value={q} onChange={e=>setPlan({...plan,[p]:+e.target.value})}/></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="modal-footer"><button className="control-btn primary-btn" onClick={()=>{const p=prompt('Product name');if(p)setPlan({...plan,[p]:0})}}>Add Product</button><button className="control-btn" onClick={save}>Save</button></div>
        </div>
      </div>
    </div>
  );
}

/* ------------- 9. MAIN APP ------------- */
function ManufacturingPlannerApp(){
  const [user,setUser]=useState(null);
  const [data,setData]=useState(JSON.parse(localStorage.manufacturingData||'[]'));
  const [cols,setCols]=useState(JSON.parse(localStorage.columnHeaders||'[]'));
  const [edit,setEdit]=useState(null);
  const [edHead,setEdHead]=useState(null);
  const [showUsers,setShowUsers]=useState(false);
  const [showWarehouse,setShowWarehouse]=useState(false);
  const [showProc,setShowProc]=useState(false);
  const [dark,setDark]=useState(localStorage.darkMode==='true');
  const [logo,setLogo]=useState(localStorage.companyLogo||'https://via.placeholder.com/170x66');
  const [showHistory,setShowHistory]=useState(false);
  const [historyData,setHistoryData]=useState(null);

  /* Dark mode toggle */
  useEffect(()=>{document.documentElement.setAttribute('data-color-scheme',dark?'dark':'light');localStorage.darkMode=dark;},[dark]);

  /* Version save hook */
  useEffect(()=>{
    const orig=localStorage.setItem;
    localStorage.setItem=function(key,val){
      orig.apply(this,arguments);
      if(['manufacturingData','columnHeaders','warehouseStock','procurementPlan'].includes(key)) saveVersion();
    };
  },[]);

  /* ------------- 10. VERSION CONTROL ------------- */
  function saveVersion(){
    const payload={
      date:new Date().toISOString().slice(0,19),
      data:JSON.parse(localStorage.manufacturingData||'[]'),
      columns:JSON.parse(localStorage.columnHeaders||'[]'),
      stock:JSON.parse(localStorage.warehouseStock||'{}'),
      plan:JSON.parse(localStorage.procurementPlan||'{}')
    };
    const versions=JSON.parse(localStorage.getItem('versions')||'[]');
    versions.unshift(payload);
    localStorage.setItem('versions',JSON.stringify(versions.slice(0,500))); // keep 500
  }
  function openHistory(){
    const vers=JSON.parse(localStorage.getItem('versions')||'[]');
    if(!vers.length){alert('No history yet');return;}
    setShowHistory(true);
  }
  function loadVersion(v){
    localStorage.manufacturingData=JSON.stringify(v.data);
    localStorage.columnHeaders=JSON.stringify(v.columns);
    localStorage.warehouseStock=JSON.stringify(v.stock);
    localStorage.procurementPlan=JSON.stringify(v.plan);
    setData(v.data);setCols(v.columns);setShowHistory(false);
    window.location.reload();
  }

  /* ------------- 11. EDIT HANDLERS ------------- */
  const handleCell=(ri,ck,val)=>{
    const d=[...data]; d[ri][ck]=parseFloat(val)||0;
    d[ri].total=cols.reduce((s,c)=>s+(d[ri][c]||0),0);
    setData(d); localStorage.manufacturingData=JSON.stringify(d);
  };
  const handleHeader=(i,val)=>{const c=[...cols];c[i]=val;setCols(c);localStorage.columnHeaders=JSON.stringify(c);};
  const addEquipment=()=>{const name=prompt('Equipment name');if(name){const row={id:generateId(),process:name};cols.forEach(c=>row[c]=0);row.total=0;setData([...data,row]);localStorage.manufacturingData=JSON.stringify([...data,row]);}};
  const delEquipment=idx=>{if(window.confirm('Delete equipment?')){const d=data.filter((_,i)=>i!==idx);setData(d);localStorage.manufacturingData=JSON.stringify(d);}};
  const editProcess=(idx,val)=>{const d=[...data];d[idx].process=val;setData(d);localStorage.manufacturingData=JSON.stringify(d);};

  /* ------------- 12. EXPORT / PRINT ------------- */
  const exportCSV=()=>{
    const rows=[['Equipment/Process',...cols,'Total'],...data.map(r=>[r.process,...cols.map(c=>r[c]||0),r.total])];
    const csv=Papa.unparse(rows);
    const blob=new Blob([csv],{type:'text/csv'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='plan.csv';a.click();
  };
  const exportPDF=()=>{
    const { jsPDF }=window.jspdf;const pdf=new jsPDF();
    pdf.setFontSize(12);pdf.text('Graviti Production Plan',14,20);
    let y=30;
    data.forEach(r=>{
      pdf.text(`${r.process}: ${r.total}`,14,y);y+=10;
      if(y>280){pdf.addPage();y=20;}
    });
    pdf.save('plan.pdf');
  };

  /* ------------- 13. MAIN RENDER ------------- */
  if(!user) return <LoginPage onLogin={setUser}/>;
  if(user.passwordChangeRequired) return <PasswordChangeModal user={user} onDone={setUser}/>;

  return(
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="header-logo"/>
          <h1 className="header-title">Graviti Pharmaceuticals – Production Planner</h1>
        </div>
        <div className="header-right">
          <button className="theme-toggle" onClick={()=>setDark(!dark)}><i className={`fas fa-${dark?'sun':'moon'}`}/> {dark?'Light':'Dark'}</button>
          <div className="user-info"><i className="fas fa-user"/> {user.username} ({user.role})</div>
          <button className="logout-btn" onClick={()=>{addAuditLog('LOGOUT','User logged out',user);setUser(null);}}>Logout</button>
        </div>
      </header>

      <main className="main-content">
        <div className="content-header">
          <div className="date-display">{new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
          <div className="controls">
            {user.role==='Super Admin'&&<button className="control-btn" onClick={()=>setShowUsers(true)}><i className="fas fa-users"/> Manage Users</button>}
            {(user.role==='Super Admin'||user.role==='Admin')&&<>
              <button className="control-btn" onClick={()=>setShowWarehouse(true)}><i className="fas fa-boxes"/> Warehouse Stock</button>
              <button className="control-btn" onClick={()=>setShowProc(true)}><i className="fas fa-clipboard-list"/> Procurement Plan</button>
              <button className="control-btn" onClick={addEquipment}><i className="fas fa-plus"/> Add Equipment</button>
              <button className="control-btn" onClick={openHistory}><i className="fas fa-history"/> View History</button>
              <button className="control-btn" onClick={exportCSV}><i className="fas fa-download"/> CSV</button>
              <button className="control-btn" onClick={exportPDF}><i className="fas fa-file-pdf"/> PDF</button>
            </>}
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipment/Process</th>
                {cols.map((c,i)=>(
                  <th key={i} className="editable-header">
                    {edHead===i?<input className="header-input" value={c} onBlur={()=>setEdHead(null)} onChange={e=>handleHeader(i,e.target.value)} autoFocus/>:<span onClick={()=>setEdHead(i)}>{c}</span>}
                  </th>
                ))}
                <th>Total</th>
                {(user.role==='Super Admin'||user.role==='Admin')&&<th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((row,ri)=>(
                <tr key={row.id||ri}>
                  <td className="editable-cell" style={{minWidth:200}}>
                    {edit===`${ri}-process`?<input className="cell-input" value={row.process} onBlur={()=>{editProcess(ri,row.process);setEdit(null);}} onChange={e=>row.process=e.target.value} autoFocus/>:<span onClick={()=>setEdit(`${ri}-process`)}>{row.process}</span>}
                  </td>
                  {cols.map((c,ci)=>(
                    <td key={ci} className="editable-cell">
                      {edit===`${ri}-${c}`?<input type="number" step="0.01" className="cell-input" value={row[c]||0} onBlur={()=>setEdit(null)} onChange={e=>handleCell(ri,c,e.target.value)} autoFocus/>:<span onClick={()=>setEdit(`${ri}-${c}`)}>{row[c]||0}</span>}
                    </td>
                  ))}
                  <td className="font-bold">{row.total||0}</td>
                  {(user.role==='Super Admin'||user.role==='Admin')&&<td><button className="delete-row-btn" onClick={()=>delEquipment(ri)}><i className="fas fa-trash"/></button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODALS */}
      {showUsers&&<UserManagementModal currentUser={user} close={()=>setShowUsers(false)}/>}
      {showWarehouse&&<WarehouseModal close={()=>setShowWarehouse(false)}/>}
      {showProc&&<ProcurementModal close={()=>setShowProc(false)}/>}
      {showHistory&&(
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:500,maxHeight:400,overflow:'auto'}}>
            <h3>Select History Snapshot</h3>
            <ul style={{listStyle:'none',padding:0}}>
              {JSON.parse(localStorage.getItem('versions')||'[]').map((v,i)=>(
                <li key={i}><button className="control-btn" onClick={()=>loadVersion(v)}>{v.date}</button></li>
              ))}
            </ul>
            <button className="control-btn" onClick={()=>setShowHistory(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------- 14. RENDER ------------- */
ReactDOM.render(<ManufacturingPlannerApp/>,document.getElementById('root'));
