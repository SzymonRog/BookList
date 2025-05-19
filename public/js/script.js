const sortBtn = document.querySelectorAll('.sort-btn');

sortBtn.forEach( btn =>{
    btn.addEventListener('click', ()=>{
        localStorage.setItem('selectSort', btn.id)
    })
})

window.addEventListener("DOMContentLoaded", ()=>{
    const selectedSort = localStorage.getItem("selectSort");
    if(selectedSort){
        const activeBtn = document.getElementById(selectedSort);
        if(activeBtn){
            activeBtn.classList.remove('font-light');
            activeBtn.classList.add('font-semibold')
        }
    }
})