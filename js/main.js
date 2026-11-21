(function(){
  // Menu mobile
  var burger=document.querySelector('.burger'), nav=document.querySelector('.nav');
  if(burger&&nav){
    burger.addEventListener('click',function(){
      var o=nav.classList.toggle('ouvert');
      burger.setAttribute('aria-expanded',o?'true':'false');
      burger.textContent=o?'Fermer':'Menu';
    });
  }

  // Année du pied de page
  var an=document.getElementById('annee'); if(an) an.textContent=new Date().getFullYear();

  // Filtres de la galerie (lit aussi #bois, #ardoise, #gravure dans l'adresse)
  var filtres=document.querySelectorAll('.filtre');
  function filtrer(cat){
    filtres.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.filtre===cat?'true':'false');});
    document.querySelectorAll('.grille .carte[data-cat]').forEach(function(c){
      c.hidden=!(cat==='tout'||c.dataset.cat.split(' ').indexOf(cat)>-1);
    });
  }
  if(filtres.length){
    filtres.forEach(function(b){b.addEventListener('click',function(){filtrer(b.dataset.filtre);});});
    var h=location.hash.replace('#','');
    if(h&&document.querySelector('.filtre[data-filtre="'+h+'"]')) filtrer(h);
  }

  // "Je veux la même" : mémorise la pièce pour préremplir le devis
  document.querySelectorAll('[data-piece]').forEach(function(a){
    a.addEventListener('click',function(){try{sessionStorage.setItem('piece',a.dataset.piece);}catch(e){}});
  });
  var desc=document.getElementById('description');
  if(desc){
    try{var p=sessionStorage.getItem('piece'); if(p&&!desc.value){desc.value='Je suis intéressé(e) par : '+p+'\n\n';} }catch(e){}
  }

  // Formulaire de devis (aperçu : l'envoi réel sera branché à la mise en ligne)
  var form=document.getElementById('form-devis');
  if(form){
    form.addEventListener('submit',function(ev){
      if(location.hostname.indexOf('lartisterie')===-1&&location.hostname.indexOf('netlify.app')===-1){
        ev.preventDefault();
        var ok=form.querySelector('.confirmation');
        if(!ok){ok=document.createElement('p');ok.className='confirmation';ok.setAttribute('role','status');form.appendChild(ok);}
        ok.textContent="Aperçu : votre demande serait envoyée à contact@lartisterie-designs.fr. L'envoi réel sera activé à la mise en ligne.";
      }
    });
  }
  // Agrandir les photos et vidéos en plein écran (hors liens et logo)
  var photos=[].slice.call(document.querySelectorAll('main img, main video')).filter(function(i){return !i.closest('a')&&!i.closest('.logo');});
  if(photos.length){
    var box=document.createElement('div'); box.className='visionneuse'; box.hidden=true;
    box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-label','Média agrandi');
    box.innerHTML='<button class="v-fermer" aria-label="Fermer">×</button><button class="v-prec" aria-label="Précédent">‹</button><figure><img alt=""><video controls playsinline loop></video><figcaption></figcaption></figure><button class="v-suiv" aria-label="Suivant">›</button>';
    document.body.appendChild(box);
    var vImg=box.querySelector('img'), vVid=box.querySelector('video'), vCap=box.querySelector('figcaption'), groupe=[], pos=0, retour=null;
    function grand(i){var s=i.getAttribute('srcset'); if(s){var c=s.split(',').map(function(x){return x.trim().split(' ')[0];}); return c[c.length-1];} return i.currentSrc||i.src;}
    function legende(i){var f=i.closest('figure'), fc=f&&f.querySelector('figcaption'); return fc?fc.textContent:(i.alt||i.getAttribute('aria-label')||'');}
    function montrer(k){pos=(k+groupe.length)%groupe.length; var i=groupe[pos];
      if(i.tagName==='VIDEO'){vImg.hidden=true; vImg.removeAttribute('src'); vVid.hidden=false; vVid.src=i.currentSrc||i.src; vVid.poster=i.poster||''; vVid.muted=false; var p=vVid.play(); if(p&&p.catch)p.catch(function(){});}
      else{vVid.pause(); vVid.hidden=true; vVid.removeAttribute('src'); vImg.hidden=false; vImg.src=grand(i); vImg.alt=i.alt;}
      vCap.textContent=legende(i); box.classList.toggle('seule',groupe.length<2);}
    function ouvrir(i){var g=i.closest('.planche-photos,.grille,section'); groupe=photos.filter(function(p){return g?g.contains(p):true;}); retour=i; box.hidden=false; document.body.classList.add('v-ouverte'); montrer(groupe.indexOf(i)); box.querySelector('.v-fermer').focus();}
    function fermer(){box.hidden=true; vVid.pause(); vVid.removeAttribute('src'); vImg.removeAttribute('src'); document.body.classList.remove('v-ouverte'); if(retour) retour.focus();}
    photos.forEach(function(i){i.classList.add('agrandir'); i.tabIndex=0; i.setAttribute('role','button'); i.setAttribute('aria-label','Agrandir : '+legende(i));
      i.addEventListener('click',function(e){e.preventDefault();ouvrir(i);});
      i.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();ouvrir(i);}});});
    box.querySelector('.v-fermer').addEventListener('click',fermer);
    box.querySelector('.v-prec').addEventListener('click',function(e){e.stopPropagation();montrer(pos-1);});
    box.querySelector('.v-suiv').addEventListener('click',function(e){e.stopPropagation();montrer(pos+1);});
    box.addEventListener('click',function(e){if(e.target===box||e.target.tagName==='FIGURE')fermer();});
    document.addEventListener('keydown',function(e){if(box.hidden)return; if(e.key==='Escape')fermer(); if(e.key==='ArrowLeft')montrer(pos-1); if(e.key==='ArrowRight')montrer(pos+1);});
    var x0=null; box.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;},{passive:true});
    box.addEventListener('touchend',function(e){if(x0===null)return; var d=e.changedTouches[0].clientX-x0; if(Math.abs(d)>50)montrer(pos+(d<0?1:-1)); x0=null;});
  }
})();
