import React,{useEffect,useRef,useState}from'react';
import{Link}from'react-router-dom';
import{supabase}from'./lib/supabase.js';

const getCourse=async()=>{const{data,error}=await supabase.from('courses').select('*').eq('id','da').single();if(error)throw error;return data};
const getSettings=async()=>{const{data,error}=await supabase.from('site_settings').select('key,value').in('key',['course_youtube_url','enrollment_price_ngn']);if(error)throw error;return Object.fromEntries((data||[]).map(x=>[x.key,x.value]))};
const videoId=u=>{try{const x=new URL(u);return x.searchParams.get('v')||x.pathname.split('/').filter(Boolean).pop()}catch{return null}};
const startOf=c=>c?.start_date?new Date(c.start_date+'T00:00:00'):new Date('2026-10-26T00:00:00');
const money=n=>'₦'+Number(n||2000).toLocaleString('en-NG');

function CourseLabel({course,settings,onOpen,compact=false}){
 const start=startOf(course),price=Number(settings.enrollment_price_ngn||2000);
 return <button className={'course-label '+(compact?'compact':'')} onClick={onOpen}><span className="course-label-icon"><i className="bi bi-bar-chart-line"/></span><span className="course-label-main"><b>{course?.title||'Data Analysis'}</b><small>{course?.description||'A practical, cohort-based learning programme built for beginners.'}</small></span><span className="course-label-meta"><span><i className="bi bi-calendar3"/>{start.toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</span><span><i className="bi bi-person-check"/>Beginner friendly</span><span><i className="bi bi-cash"/> {money(price)}</span></span><i className="bi bi-chevron-right course-label-arrow"/></button>
}

function CoursePreview({course,settings,user,onClose}){
 const start=startOf(course),video=videoId(settings.course_youtube_url),price=Number(settings.enrollment_price_ngn||2000);
 return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="course-modal course-preview-new" role="dialog" aria-modal="true">
  <div className="course-modal-head"><div><span className="eyebrow">CURRENT COHORT</span><h2>{course?.title||'Data Analysis'}</h2></div><button className="icon-button" onClick={onClose}><i className="bi bi-x-lg"/></button></div>
  {video&&<div className="course-modal-video"><iframe src={'https://www.youtube.com/embed/'+video} title="Course introduction" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div>}
  <p className="course-modal-description">{course?.description||'A structured cohort programme designed to build practical confidence with data and analysis.'}</p>
  <div className="course-facts"><div><i className="bi bi-calendar3"/><span><small>Starts</small><b>{start.toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})}</b></span></div><div><i className="bi bi-clock"/><span><small>Duration</small><b>{course?.duration_weeks?course.duration_weeks+' weeks':'Cohort-based'}</b></span></div><div><i className="bi bi-bar-chart"/><span><small>Level</small><b>Beginner friendly</b></span></div><div><i className="bi bi-cash-stack"/><span><small>Fee</small><b>{money(price)}</b></span></div></div>
  <div className="course-includes"><span className="eyebrow">WHAT YOU GET</span><div><span><i className="bi bi-check2"/>Structured lessons</span><span><i className="bi bi-check2"/>Practical assignments</span><span><i className="bi bi-check2"/>Assessment & feedback</span><span><i className="bi bi-check2"/>Verified completion</span></div></div>
  <div className="course-modal-actions"><Link className="btn" to={user?'/enroll/da':'/signup'} onClick={onClose}>Apply for this cohort <i className="bi bi-arrow-right"/></Link><Link className="btn o" to={user?'/enroll/da':'/login'} onClick={onClose}>Use enrollment code</Link></div>
  <p className="course-private-note"><i className="bi bi-lock-fill"/> Course learning content unlocks after confirmed enrollment.</p>
 </div></div>
}

export function PublicHome({user}){
 const[course,setCourse]=useState(null),[settings,setSettings]=useState({}),[open,setOpen]=useState(false),[videos,setVideos]=useState([]);
 useEffect(()=>{Promise.all([getCourse(),getSettings()]).then(([c,s])=>{setCourse(c);setSettings(s)}).catch(()=>{});supabase.from('site_videos').select('*').eq('published',true).order('sort_order').limit(6).then(({data})=>setVideos(data||[])).catch(()=>{})},[]);
 const name=user?.user_metadata?.full_name?.split(' ')[0]||'Learner';
 return <section className="public-home home-new">
  <section className="home-welcome"><div><span className="eyebrow">TAMP · YOUR CAMPUS</span><h1>{user?<>Welcome back, {name}.</>:<>Welcome to TAMP.</>}</h1><p>{user?'Your cohort, learning and academic progress are kept in one focused space.':'A focused technical campus for practical, cohort-based learning.'}</p></div>{user&&<Link className="home-profile-chip" to="/profile"><span>{name[0]?.toUpperCase()||'L'}</span><i className="bi bi-chevron-right"/></Link>}</section>
  <section className="home-cohort-block"><div className="home-section-head"><div><span className="eyebrow">CURRENT COHORT</span><h2>Courses available now</h2><p>Only courses open for the current cohort appear here.</p></div><Link to="/courses">Browse all <i className="bi bi-arrow-up-right"/></Link></div>{course?<CourseLabel course={course} settings={settings} compact onOpen={()=>setOpen(true)}/>:<div className="home-no-course"><i className="bi bi-calendar2-x"/><div><b>No courses available for this cohort.</b><span>Check back when the next cohort opens.</span></div></div>}</section>
  <section className="home-video-section"><div className="home-section-head"><div><span className="eyebrow">GET TO KNOW TAMP</span><h2>See how the campus works.</h2><p>Short explanations before you begin.</p></div></div>{videos.length?<div className="home-video-grid">{videos.map((v,i)=><article key={v.id||i} className="home-video-card"><div className="home-video-frame"><iframe src={'https://www.youtube.com/embed/'+(videoId(v.url)||v.video_id)} title={v.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div><div><span>{String(i+1).padStart(2,'0')}</span><h3>{v.title}</h3><p>{v.description||'A quick guide to using TAMP with confidence.'}</p></div></article>)}</div>:<div className="home-video-placeholder"><i className="bi bi-play-circle"/><div><b>How TAMP works</b><span>Course videos and orientation guides will appear here.</span></div></div>}</section>
  <section className="home-how-new"><div><span className="eyebrow">THE SIMPLE PATH</span><h2>Everything has a place.</h2></div><div className="home-how-steps"><article><b>01</b><h3>Choose</h3><p>Find a course for your cohort and read the public details.</p></article><article><b>02</b><h3>Enroll</h3><p>Use the approved payment route or an enrollment code.</p></article><article><b>03</b><h3>Learn</h3><p>Unlock lessons, readings, quizzes and assignments after enrollment.</p></article><article><b>04</b><h3>Prove it</h3><p>Complete the academic journey and receive verifiable results.</p></article></div></section>
  {open&&course&&<CoursePreview course={course} settings={settings} user={user} onClose={()=>setOpen(false)}/>}
 </section>
}

export function CourseCatalog({user}){
 const[course,setCourse]=useState(null),[settings,setSettings]=useState({}),[query,setQuery]=useState(''),[open,setOpen]=useState(false),[focus,setFocus]=useState(false);
 useEffect(()=>{Promise.all([getCourse(),getSettings()]).then(([c,s])=>{setCourse(c);setSettings(s)}).catch(()=>{})},[]);
 const match=!query.trim()||[course?.title,course?.description,'data analysis','beginner'].join(' ').toLowerCase().includes(query.trim().toLowerCase());
 useEffect(()=>{const esc=e=>e.key==='Escape'&&setFocus(false);window.addEventListener('keydown',esc);return()=>window.removeEventListener('keydown',esc)},[]);
 return <section className="catalog-page catalog-new">
  <div className={'catalog-search-dock '+(focus?'focused':'')}><div className="catalog-search-line"><i className="bi bi-search"/><input autoFocus={focus} value={query} onFocus={()=>setFocus(true)} onChange={e=>setQuery(e.target.value)} placeholder="Search courses, skills, levels…" aria-label="Search courses"/>{query&&<button onClick={()=>setQuery('')} aria-label="Clear search"><i className="bi bi-x-lg"/></button>}<kbd>⌘ K</kbd></div>{focus&&<div className="search-command"><span>SEARCHING TAMP COURSES</span><b>{query?'“'+query+'”':'Type a course, skill or level'}</b><small>Press Esc to close search focus</small></div>}</div>
  <div className="catalog-discovery"><div className="catalog-discovery-copy"><span className="hero-kicker"><i className="bi bi-grid-3x3-gap-fill"/> COURSE DIRECTORY</span><h1>Find your next course.</h1><p>Browse the programmes available for the current cohort. Public information stays open; academic content stays protected.</p></div><div className="catalog-signal"><span>COHORT</span><b>26 OCT</b><small>2026</small></div></div>
  <div className="catalog-results"><div className="results-head"><span>{match&&course?'AVAILABLE NOW':'SEARCH RESULTS'}</span><span>{match&&course?'1 course':'0 courses'}</span></div>{match&&course?<CourseLabel course={course} settings={settings} onOpen={()=>setOpen(true)}/>:<div className="empty-search"><i className="bi bi-search"/><h2>No course found</h2><p>Try a course name, skill or level.</p><button className="btn o" onClick={()=>{setQuery('');setFocus(true)}}>Search again</button></div>}</div>
  <div className="catalog-note"><i className="bi bi-lock"/><span><b>Learning stays private.</b> Lessons, readings, quizzes and assignments become available only after enrollment.</span></div>
  {open&&course&&<CoursePreview course={course} settings={settings} user={user} onClose={()=>setOpen(false)}/>}
 </section>
}
