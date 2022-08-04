const plugins = await fetch("/website-plugin/plugins.json").then(res => res.json());
const searchBox = document.getElementById('searchBox');
const searchModal = document.getElementById('searchModal');

function resetSearch() {
  document.getElementById('searchResult').innerHTML = '';
}

function sanitize(str) {
  return str.replace(/[<>&"]/g, (c) => {return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});
}

function search(token) {
  let results = [];
  resetSearch();
  results = plugins.all.filter(plugin => {
    if (plugin.keywords){
      return plugin.name.toLowerCase().includes(token) || plugin.description.toLowerCase().includes(token) || plugin.author.toLowerCase().includes(token) || plugin.keywords.some(tag => tag.toLowerCase().includes(token));
    } else {
      return plugin.name.toLowerCase().includes(token) || plugin.description.toLowerCase().includes(token) || plugin.author.toLowerCase().includes(token);
    }
  });

  if (results.length > 0) {
    document.getElementById('searchResult').innerHTML = results.map(plugin => 
      `<div class="card mt-2 mb-2">
        <a class="card-body" style="text-decoration: none;" href="/website-plugin/plugin/${plugin.id}">
          <h5 class="card-title">${sanitize(plugin.name)}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${plugin.author} - ${sanitize
            (plugin.description)}</h6>
        </a>
      </div>`
    ).join('');
  } else {
    document.getElementById('searchResult').innerHTML = 
    `<div class="py-5">
      <p class="text-center mb-3"><span class="fa-solid fa-box-open fa-4x text-muted"></span></p>
      <h5 class="text-muted text-center mb-23">No result</h5> 
    </div>`;
  }
}

searchBox.addEventListener('keyup', async function(e) {
    search(e.target.value.toLowerCase());
})

// Auto foucus on search box
searchModal.addEventListener('shown.bs.modal', () => {
  searchBox.focus()
})
