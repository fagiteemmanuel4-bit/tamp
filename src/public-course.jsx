import React,{useEffect,useState}from'react';
import{Link}from'react-router-dom';
import{supabase}from'./lib/supabase.js';

const getCourse=async()=>{const{data,error}=await supabase.from('courses').select('*').eq('id','da').single();if(error)throw error;return data};
const getSettings=async()=>{const{data,error}=await supabase.from('site_settings').select('key,value').in('key',['course_youtube_url','enrollment_price_ngn']);if(error)throw error;return Object.fromEntries((data||[]).map(x=>[x.key,x.value]))};
const videoId=u=>{try{const x=new URL(u);return x.searchParams.get('v')||x.pathname.split('/').filter(Boolean).pop()}catch{return null}};

function CoursePreview({course,settings,user,onClose}){
 const start=course?.start_date?new Date(course.start_date+'T00:00:00'):new Date('2026-10-26T00:00:00');
 const video=videoId(settings.course_youtube_url),price=Number(settings.enrollment_price_ngn||2000);
 return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="course-modal" role="dialog" aria-modal="true">
  <div className="course-modal-head"><div><span className="eyebrow">CURRENT COHORT · OCTOBER 2026</span><h2>{course?.title||'Data Analysis'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><i className="bi bi-x-lg"/></button></div>
  {video&&<div className="course-modal-video"><iframe src={'https://www.youtube.com/embed/'+video} title="Course introduction" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div>}
  <p className="course-modal-description">{course?.description||'A structured cohort programme designed to build practical confidence with data and analysis.'}</p>
  <div className="course-facts">
   <div><i className="bi bi-calendar3"/><span><small>Starts</small><b>{start.toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})}</b></span></div>
   <div><i className="bi bi-clock"/><span><small>Format</small><b>{course?.duration_weeks?course.duration_weeks+' weeks':'Cohort-based'}</b></span></div>
   <div><i className="bi bi-bar-chart"/><span><small>Level</small><b>Beginner friendly</b></span></div>
   <div><i className="bi bi-cash-stack"/><span><small>Enrollment</small><b>₦{price.toLocaleString('en-NG')}</b></span></div>
  </div>
  <div className="course-includes"><span className="eyebrow">YOUR ENROLLMENT INCLUDES</span><div><span><i className="bi bi-check2"/>Structured cohort learning</span><span><i className="bi bi-check2"/>Daily practical work</span><span><i className="bi bi-check2"/>Assessment and feedback</span><span><i className="bi bi-check2"/>Completion verification</span></div></div>
  <div className="course-modal-actions"><Link className="btn" to={user?'/enroll/da':'/signup'} onClick={onClose}><i className="bi bi-arrow-right-circle"/> Apply for this cohort</Link><Link className="btn o" to={user?'/enroll/da':'/login'} onClick={onClose}><i className="bi bi-key"/> Already have an enrollment code</Link></div>
  <p className="course-private-note"><i className="bi bi-lock-fill"/> Lessons, readings, quizzes and assignments unlock only after confirmed enrollment.</p>
 </div></div>
}

function CourseCard({course,settings,onOpen}){
 const price=Number(settings.enrollment_price_ngn||2000),start=course?.start_date?new Date(course.start_date+'T00:00:00'):new Date('2026-10-26T00:00:00');
 return <button className="catalog-card" onClick={onOpen}><div className="catalog-card-top"><span className="course-badge"><i className="bi bi-graph-up-arrow"/> CURRENT COHORT</span><span className="catalog-arrow"><i className="bi bi-arrow-up-right"/></span></div><div className="catalog-icon"><i className="bi bi-bar-chart-line-fill"/></div><h2>{course?.title||'Data Analysis'}</h2><p>{course?.description||'Build practical confidence working with data in a guided cohort environment.'}</p><div className="catalog-meta"><span><i className="bi bi-calendar3"/> {start.toLocaleDateString('en-NG',{day:'numeric',month:'short'})}</span><span><i className="bi bi-person-badge"/> Beginner friendly</span><span><i className="bi bi-cash"/> ₦{price.toLocaleString('en-NG')}</span></div><span className="catalog-cta">View course <i className="bi bi-arrow-right"/></span></button>
}

export function PublicHome({user}){
 const[course,setCourse]=useState(null),[settings,setSettings]=useState({}),[open,setOpen]=useState(false);
 useEffect(()=>{Promise.all([getCourse(),getSettings()]).then(([c,s])=>{setCourse(c);setSettings(s)}).catch(()=>{})},[]);
 return <section className="public-home"><div className="home-hero-modern"><div className="home-hero-copy"><span className="hero-kicker"><i className="bi bi-mortarboard-fill"/> TAMP · TECHNICAL CAMPUS</span><h1>Learn practical skills.<br/><em>Build something real.</em></h1><p>Structured cohort learning for people who want a clear path, useful practice and measurable progress.</p><div className="hero-actions"><a className="btn" href="#current-course"><i className="bi bi-arrow-down-circle"/> Explore this cohort</a>{user?<Link className="btn o" to="/learn"><i className="bi bi-journal-bookmark"/> My learning</Link>:<Link className="btn o" to="/signup"><i className="bi bi-person-plus"/> Create account</Link>}</div></div><div className="hero-visual"><div className="hero-orbit orbit-a"/><div className="hero-orbit orbit-b"/><div className="hero-stat-card"><span className="eyebrow">NEXT COHORT</span><strong>26</strong><b>OCTOBER 2026</b><small>Applications are open</small></div></div></div><div className="home-proof-row"><span><i className="bi bi-calendar2-week"/> Cohort-based</span><span><i className="bi bi-briefcase"/> Practical work</span><span><i className="bi bi-patch-check"/> Verified completion</span></div><section className="home-course-section" id="current-course"><div className="section-intro"><span className="eyebrow">AVAILABLE THIS COHORT</span><h2>One focused course.<br/>A clear place to start.</h2><p>More courses will appear here as new cohorts open. For now, Data Analysis is the active programme.</p></div>{course?<CourseCard course={course} settings={settings} onOpen={()=>setOpen(true)}/>:<div className="card">Loading the current cohort…</div>}</section><section className="home-how"><div><span className="eyebrow">HOW TAMP WORKS</span><h2>Simple from application to completion.</h2></div><div className="home-how-grid"><article><b>01</b><h3>Choose a course</h3><p>Review the public information for the current cohort.</p></article><article><b>02</b><h3>Enroll</h3><p>Pay through the approved channel or use an enrollment code supplied by TAMP.</p></article><article><b>03</b><h3>Learn privately</h3><p>Lessons, assessments and assignments unlock only after confirmed enrollment.</p></article></div></section><section className="home-bottom-cta"><span className="eyebrow">OCTOBER 2026 COHORT</span><h2>Start with Data Analysis.</h2><p>Applications are open. The cohort begins October 26, 2026.</p><Link className="btn" to="/courses"><i className="bi bi-arrow-right"/> View available courses</Link></section>{open&&course&&<CoursePreview course={course} settings={settings} user={user} onClose={()=>setOpen(false)}/>}</section>
}

export function CourseCatalog({user}){
 const[course,setCourse]=useState(null),[settings,setSettings]=useState({}),[query,setQuery]=useState(''),[open,setOpen]=useState(false);
 useEffect(()=>{Promise.all([getCourse(),getSettings()]).then(([c,s])=>{setCourse(c);setSettings(s)}).catch(()=>{})},[]);
 const match=!query.trim()||[course?.title,course?.description,'data analysis'].filter(Boolean).join(' ').toLowerCase().includes(query.trim().toLowerCase());
 return <section className="catalog-page"><div className="catalog-hero"><span className="hero-kicker"><i className="bi bi-grid-3x3-gap-fill"/> COURSE DIRECTORY</span><h1>Find your next course.</h1><p>Explore courses available for the current TAMP cohort. Private learning content stays behind enrollment.</p><div className="catalog-search"><i className="bi bi-search"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search upcoming courses…" aria-label="Search courses"/></div></div><div className="catalog-results"><div className="results-head"><span>{match&&course?'1 course available':'No matching courses'}</span><span>October 2026 cohort</span></div>{match&&course?<CourseCard course={course} settings={settings} onOpen={()=>setOpen(true)}/>:<div className="empty-search"><i className="bi bi-search"/><h2>No course found</h2><p>Try another search. New courses will appear here when they open.</p></div>}</div>{open&&course&&<CoursePreview course={course} settings={settings} user={user} onClose={()=>setOpen(false)}/>}</section>
}
