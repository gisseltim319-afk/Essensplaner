/* Offline-Speicher fuer die App-Dateien. Daten selbst liegen in Supabase und im Browser-Speicher. */
const CACHE="wochenplaner-v1";
const CORE=["./","index.html","manifest.webmanifest","apple-touch-icon.png","icon-512.png"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener("fetch",function(e){
  var req=e.request,u=new URL(req.url);
  if(req.method!=="GET"||u.hostname.endsWith("supabase.co"))return;
  e.respondWith(
    fetch(req).then(function(r){
      if(r&&(r.ok||r.type==="opaque")){var c=r.clone();caches.open(CACHE).then(function(x){x.put(req,c)})}
      return r;
    }).catch(function(){
      return caches.match(req).then(function(m){return m||(req.mode==="navigate"?caches.match("index.html"):Response.error())});
    })
  );
});
