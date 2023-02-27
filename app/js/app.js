import * as functions from "./modules/functions.js";
import Swiper, { Pagination, Autoplay, EffectFade, Navigation, Grid, FreeMode } from 'swiper';
import mixitup from 'mixitup';
import Swal from 'sweetalert2';

functions.isWebp();

const asideOpenBtn = document.querySelector('.header__btn');
const asideMenu = document.querySelector('.header__aside');
const asideCloseBtn = document.querySelector('.header__aside-btn');
const mobileBtn = document.querySelector('.header__mobile-btn');
const mobileMenu = document.querySelector('.header__mobile-menu');

if (document.querySelector(`.header__mobile-link[href="./${path()}"]`)) {
  document.querySelector(`.header__mobile-link[href="./${path()}"]`)
    .parentNode.remove();
}

if (document.querySelector(`.header__menu-link[href="./${path()}"]`)) {
  document.querySelector(`.header__menu-link[href="./${path()}"]`)
    .parentNode.classList.add('active');
  console.log('test');
}


function openAside() {
  asideMenu.classList.toggle('closed');
  document.body.classList.toggle('scrollHidden');

  if (!asideMenu.classList.contains('closed')) {
    return asideCloseBtn.setAttribute('tabindex', '2');
  }
  
  asideCloseBtn.setAttribute('tabindex', '-1');
}

function getMobileMenu() {
  mobileMenu.classList.toggle('closed');
  mobileBtn.classList.toggle('closed');
  document.querySelectorAll('.header__mobile-item').forEach(el => el.classList.toggle('active'));
  document.body.classList.toggle('scrollHidden');
}

mobileBtn.onclick = getMobileMenu;
asideOpenBtn.onclick = openAside;
asideCloseBtn.onclick = openAside;


const swiper = new Swiper('.swiper', {
  modules: [Pagination, Autoplay, EffectFade],
  effect: 'fade',
  fadeEffect: {
    crossFade: true,
  },
  loop: true,
  pagination: {
    el: '.swiper-pagination',
    clickable: true
  },
  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
  }
});

const blogSwiper = new Swiper('.blog__swiper', {
  modules: [Pagination, Navigation, EffectFade, Grid],
  slidesPerView: 1,
  grid: {
    rows: 2,
    fill: 'row'
  },
  allowTouchMove: false,
  // effect: 'fade',
  // fadeEffect: {
  //   crossFade: true,
  // },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
    renderBullet: function (index, className) {
      return '<span class="' + className + '">' + (index + 1) + "</span>";
    },
  },
  navigation: {
    nextEl: ".swiper-navigation-next",
    prevEl: ".swiper-navigation-prev"
  }
})

const contactSwiper = new Swiper('.contact-slider__inner', {
  modules: [Autoplay, Pagination, FreeMode],
  slidesPerView: 10,
  speed: 3000,
  pagination: {
    el: '.contact-swiper-pagination',
    clickable: true,
    dynamicBullets: true,
    // dynamicMainBullets: 3
  },
  freeMode: true,
  spaceBetween: 18,
  autoplay: {
    delay: 0,
    pauseOnMouseEnter: true,
    disableOnInteraction: false,
  },
  loop: true,
  breakpoints: {
    320: {
      slidesPerView: 2,
      spaceBetween: 10
    },
    600: {
      slidesPerView: 3
    },
    1000: {
      slidesPerView: 4
    },
    1200: {
      slidesPerView: 5
    },
    1600: {
      slidesPerView: 8
    },
    1800: {
      slidesPerView: 10
    }
  }
})

if (document.querySelector('.gallery__content')) {
  const galleryContent = document.querySelector('.gallery__content');
  const mixer = mixitup(galleryContent);
  mixer.filter('.living');
}

if (document.querySelector('.about__video-link')) {
  document.querySelector('.about__video-link').onclick = () => {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Sorry, no video for you...',
      confirmButtonColor: '#363838',

    })
  };
}

function path() {
  return document.location.href.split('\\').pop().split('/').pop();
}

function headerPadding() {
  let header = document.querySelector('.header');
  let headerHeight = header.clientHeight;
  document.querySelector('.header').nextElementSibling.style.marginTop = headerHeight + "px";
}

headerPadding();

window.onresize = headerPadding;

window.onscroll = () => {
  let header = document.querySelector('.header');
  let inner = document.querySelector('.header__inner');
  let headerHeight = header.clientHeight;

  if (window.scrollY > headerHeight / 2) {
    inner.classList.add('fixed');
    header.classList.add('fixed')
  } else {
    inner.classList.remove('fixed');
    header.classList.remove('fixed')
  }
}

