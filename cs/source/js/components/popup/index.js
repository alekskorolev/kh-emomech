import $ from 'jquery';

import {BaseComponent} from 'muce.io';

import template from './template.html';
import './style.scss';

class PopupComponent extends BaseComponent {
    initialize(options) {
        this.template = template;
        super.initialize(options);
        this.$root = $(options.root || 'body');
        this.popupId = this.data['popup-id'] || this.uId;
        this.rootEventsInit();
        this.delegateEvents({
            'click .close': 'close'
        });
    }
    rootEventsInit() {
        this.$root.on('popups:close', this.close.bind(this));
        this.$root.on('popup:open:' + this.popupId, this.open.bind(this));

    }
    open() {
        this.$root.trigger('popups:close', this);
        this.$('.overlay').show();
    }
    close() {
        this.$('.overlay').hide();
    }
}

export default PopupComponent;