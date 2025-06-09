//Manual script to download a text-based view of the page's mods
//This is using the "dependents" -> "required dependencies" screen of curseforge
//Done for both fabric and forge, miners ignore duplicates
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}download("page.txt",document.querySelector(".listing.listing-project.project-listing").innerText); 