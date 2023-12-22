function copy (nr) {

  el = document.getElementById("text-" + nr);
  console.log(el.innerText);

   // Copy the text inside the text field
  navigator.clipboard.writeText(el.innerText);

  // Alert the copied text

  const popup = document.getElementById('popup');


  // Show popup
  popup.style.bottom = '20px';
  popup.style.opacity = '1';

  // Hide popup and overlay after 3 seconds
  setTimeout(() => {
    popup.style.bottom = '-100px';
    popup.style.opacity = '0';
  }, 3000);

}