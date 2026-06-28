const menuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.navigation');
const actions = document.querySelector('.header__actions');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        nav.classList.toggle('is-active');
        actions.classList.toggle('is-active');
    });
}
