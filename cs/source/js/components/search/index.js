import $ from 'jquery';

import {BaseComponent} from 'muce.io';

import template from './template.html';
import './style.scss';

class SearchComponent extends BaseComponent {
    beforeInitialize(options) {
        this.events = {
            'keyup .jsc-input': 'input'
        }
        this.template = template;
        super.beforeInitialize(options);
    }
    rootEventsInit() {
/*        this.$root.on('popups:close', this.close.bind(this));
        this.$root.on('popup:open:' + this.popupId, this.open.bind(this));*/
    }
    input(event) {
        console.log(event);
    }
}

export default SearchComponent;