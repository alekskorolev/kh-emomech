import $ from 'jquery';

import {BaseComponent} from 'muce.io';

import template from './template.html';
import './style.scss';

class SearchComponent extends BaseComponent {
    beforeInitialize(options) {
        this.delegateEvents({
            'keyup .jsc-input': 'input',
            'click .jsc-check': 'click'
        });
        this.template = template;
        super.beforeInitialize(options);
    }
    click(event) {
        event.value = this.$('.jsc-input').val();
        this.jTrigger('action.search', event);
    }
    input(event) {
        if (event.keyCode === 13) {
            event.value = $(event.currentTarget).val();
            this.jTrigger('action.search', event);
        }
    }
}

export default SearchComponent;