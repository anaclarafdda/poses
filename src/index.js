import './css/style.css';

function app() {
    const el = document.createElement('h1');
    el.innerText = 'Hello World'

    return el;
}

document.body.append(app());