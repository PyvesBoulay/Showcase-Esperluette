//Listen for scroll start and stop to animate the page counter in the bottom left
window.addEventListener('ScrollSnapStart', e => {
    const pageIndicators_dashes = Array.from(document.getElementsByClassName('page_indicator_line'));
    const pageIndicatorNumber = document.getElementById('page_indicator_number_span');
    pageIndicators_dashes.forEach(e => e.classList.remove('page_indicator_line_selected'));
    pageIndicators_dashes[e.detail.toId].classList.add('page_indicator_line_selected');
    pageIndicatorNumber.innerText = e.detail.toId+1;
});

function updateS3TitleWidth() {
    const mq = window.matchMedia("(min-width: 600px) and (max-width: 1024px)").matches;
    if (!mq) {
        let text = document.createElement("span");
        document.body.appendChild(text);

        text.style.fontFamily = "Montserrat-ExtraBold, sans-serif";
        text.style.lineHeight = getComputedStyle(document.body).getPropertyValue('--title-line-height');
        text.style.fontSize = getComputedStyle(document.querySelector('#s3 .s_title')).getPropertyValue('font-size');
        text.style.letterSpacing = getComputedStyle(document.querySelector('#s3 .s_title')).getPropertyValue('letter-spacing');
        text.style.height = 'auto';
        text.style.width = 'auto';
        text.style.position = 'absolute';
        text.style.whiteSpace = 'nowrap';
        text.style.padding = '1rem';
        text.innerHTML = s3_title;

        let width = Math.ceil(text.clientWidth);
        document.body.removeChild(text);

        document.querySelector('#s3 .section_gradient').style.width = width+'px';
        document.querySelector('#s3_side_image_wrapper_dttab').style.width = 'calc('+(document.querySelector('#s3 > div').clientWidth-width)+'px - calc(var(--spacing) / 2))';
    }
}

window.addEventListener('load', updateS3TitleWidth);
window.addEventListener('resize', updateS3TitleWidth);

let ScrollSnaper;
function scrollSnapperInit() {
    const mq = window.matchMedia("(max-width: 600px)").matches;
    if (mq) {
        document.getElementById('s3_part1_mobile').classList.add('ScrollSnap_Anchor');
        document.getElementById('s3_part1_mobile').style.display = 'block';
        document.getElementById('s3_part2_mobile').classList.add('ScrollSnap_Anchor');
        document.getElementById('s3_part2_mobile').style.display = 'flex';
        document.getElementById('s3').classList.remove('ScrollSnap_Anchor');
        document.getElementById('s3').style.display = 'none';
        if (document.getElementById('page_indicator_lines_wrapper').childElementCount === 4) {
            let pi = document.createElement('div');
            pi.classList.add('page_indicator_line')
            document.getElementById('page_indicator_lines_wrapper').appendChild(pi);
        }
    } else {
        document.getElementById('s3_part1_mobile').classList.remove('ScrollSnap_Anchor');
        document.getElementById('s3_part1_mobile').style.display = 'none';
        document.getElementById('s3_part2_mobile').classList.remove('ScrollSnap_Anchor');
        document.getElementById('s3_part2_mobile').style.display = 'none';
        document.getElementById('s3').classList.add('ScrollSnap_Anchor');
        document.getElementById('s3').style.display = 'block';
        if (document.getElementById('page_indicator_lines_wrapper').childElementCount === 5) {
            document.getElementById('page_indicator_lines_wrapper').removeChild(document.getElementById('page_indicator_lines_wrapper').lastElementChild);
        }
    }

    ScrollSnaper = new ScrollSnap();
}

window.addEventListener('load', scrollSnapperInit);
window.addEventListener('resize', scrollSnapperInit);