var btn_el2 = document.getElementById("btn_el");
btn_el2.disabled = true;

document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

function copy (nr) {
    el = document.getElementById("text-" + nr);
    console.log(el.innerText);
    navigator.clipboard.writeText(el.innerText);
    
    const popup = document.getElementById('popup');
    popup.style.bottom = '20px';
    popup.style.opacity = '1';
  
    setTimeout(() => {
      popup.style.bottom = '-100px';
      popup.style.opacity = '0';
    }, 3000);
  
  }

function showGraph () {
  var btn_el2 = document.getElementById("btn_el");

  console.log(btn_el2.disabled)

  if (!btn_el2.disabled) {
    it = document.getElementById("image_thing");
    it.src = "data:image/png;base64," + graphBytes;

    it = document.getElementById("overlay");
    it.style.visibility = "visible";

    it = document.getElementById("imagePopup");
    it.style.visibility = "visible";

    it = document.getElementById("image_self");
    it.style.visibility = "visible";
  }

}

function closeIMG () {
  it = document.getElementById("overlay");
  it.style.visibility = "hidden";

  it = document.getElementById("imagePopup");
  it.style.visibility = "hidden";

  it = document.getElementById("image_self");
  it.style.visibility = "hidden";
}