self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
  let data={title:'TAMP',body:'You have a new TAMP notification.',url:'/notifications'};
  try{if(event.data)data={...data,...event.data.json()}}catch{}
  event.waitUntil(self.registration.showNotification(data.title,{body:data.body,tag:data.tag||'tamp',data:{url:data.url||'/notifications'},icon:'/favicon.ico',badge:'/favicon.ico'}));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=event.notification.data?.url||'/notifications';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const client of list){if('focus'in client){client.navigate(url);return client.focus()}}
    return clients.openWindow(url);
  }));
});
self.addEventListener('message',event=>{
  if(event.data?.type==='TAMP_NOTIFY'){const d=event.data;event.waitUntil(self.registration.showNotification(d.title||'TAMP',{body:d.body||'',tag:d.tag||'tamp',data:{url:d.url||'/notifications'}}))}
});