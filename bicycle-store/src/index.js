import '@lwc/synthetic-shadow';
import { createElement } from 'lwc';
import MyApp from 'my/app';

const app = createElement('my-app', { is: MyApp });
document.body.appendChild(app);