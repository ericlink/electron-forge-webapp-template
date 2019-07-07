// remember window location
require('electron-cookies')

// open all links in external browser
document.addEventListener('click', (event) => {
  console.log(event);
  if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
    event.preventDefault();
    require('electron').shell.openExternal(event.target.href);
  }
})



