import './css/style.css';
import init from './poseNet';

(function app() {
    const el = document.createElement('h1');
    el.innerText = 'Hello World'
    document.body.append(el);

    // buildBody();

    window.setTimeout(init, 100);
    // init();

})();

// document.body.append(app());