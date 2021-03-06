/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {MDCFoundation} from '@material/base';
import {cssClasses, strings, numbers} from './constants';
import {MDCSimpleMenuFoundation} from '@material/menu';

const OPENER_KEYS = [
  {key: 'ArrowUp', keyCode: 38, forType: 'keydown'},
  {key: 'ArrowDown', keyCode: 40, forType: 'keydown'}
];

export default class MDCExtAutocompleteFoundation extends MDCFoundation {
  static get cssClasses() {
    return cssClasses;
  }

  static get strings() {
    return strings;
  }

  static get defaultAdapter() {
    return {
      addClass: (/* className: string */) => {},
      removeClass: (/* className: string */) => {},
      setAttr: (/* attr: string, value: string */) => {},
      rmAttr: (/* attr: string */) => {},
      registerInteractionHandler: (/* type: string, handler: EventListener */) => {},
      deregisterInteractionHandler: (/* type: string, handler: EventListener */) => {},
      hasItemsLoader: () => /* boolean */ false,
      applyItemsLoader: (/* query: string */) => {},
      removeAllItems: () => {},
      addItem: (/* value: string, description: string */) => {},
      setListElStyle: (/* propertyName: string, value: string */) => {},
      getNumberOfAvailableItems: () => /* number */ 0,
      getSelectedItem: () => /* HTMLElement */ {},
      selectPreviousAvailableItem: () => {},
      selectNextAvailableItem: () => {},
      getTextForItemAtIndex: (/* index: number */) => /* string */ '',
      getValueForItemAtIndex: (/* index: number */) => /* string */ '',
      addClassForItemAtIndex: (/* index: number, className: string */) => {},
      rmClassForItemAtIndex: (/* index: number, className: string */) => {},
      setAttrForItemAtIndex: (/* index: number, attr: string, value: string */) => {},
      registerInputInteractionHandler: (/* type: string, handler: EventListener */) => {},
      deregisterInputInteractionHandler: (/* type: string, handler: EventListener */) => {},
      registerListInteractionHandler: (/* type: string, handler: EventListener */) => {},
      deregisterListInteractionHandler: (/* type: string, handler: EventListener */) => {},
      getNativeInput: () => /* HTMLInputElement */ {},

    };
  }

  constructor(adapter) {
    super(Object.assign(MDCExtAutocompleteFoundation.defaultAdapter, adapter));
    this.selectedIndex_ = -1;
    this.disabled_ = false;
    this.lastValue_ = undefined;
    this.valueField_ = 'value';
    this.descriptionField_ = 'description';
    //this.inputFocusHandler_ = () => this.activateFocus_();
    //this.inputBlurHandler_ = () => this.deactivateFocus_();
    this.displayHandler_ = (evt) => {
      evt.preventDefault();
      this.handleInputValue_();

      // if ((this.adapter_.getNumberOfAvailableItems() > 0) && !this.adapter_.isMenuOpen()) {
      this.open_();
      // }
    };
    this.listHandler_ = (evt) => {
      this.setInputValue(evt.target.innerText);
    };
    this.displayViaKeyboardHandler_ = (evt) => this.handleDisplayViaKeyboard_(evt);
    // this.selectionHandler_ = ({detail}) => {
    //   const {index} = detail;
    //   this.close_();
    //   if (index !== this.selectedIndex_) {
    //     this.setSelectedIndex(index);
      rmAttrForItemAtIndex: (/* index: number, attr: string */) => {},
    //     this.adapter_.notifyChange();
    //   }
    // };
    // this.cancelHandler_ = () => {
    //   this.close_();
    // };
    /** @private {boolean} */
    this.isOpen_ = false;
    /** @private {number} */
    this.changeValueTriggerTimerId_ = 0;
  }

  init() {
    // this.ctx_ = this.adapter_.create2dRenderingContext();
    this.adapter_.registerInputInteractionHandler('focus',this.inputFocusHandler_);
    this.adapter_.registerInputInteractionHandler('blur',this.inputBlurHandler_);
    this.adapter_.registerInteractionHandler('click', this.displayHandler_);
    this.adapter_.registerInputInteractionHandler('keydown', this.displayViaKeyboardHandler_);
    this.adapter_.registerInputInteractionHandler('keyup', this.displayViaKeyboardHandler_);
    this.adapter_.registerListInteractionHandler('click', this.listHandler_);
    this.resize();
  }

  destroy() {
    clearTimeout(this.changeValueTriggerTimerId_);
    this.adapter_.deregisterInputInteractionHandler('focus',this.inputFocusHandler_);
    this.adapter_.deregisterInputInteractionHandler('blur',this.inputBlurHandler_);
    this.adapter_.deregisterInteractionHandler('click', this.displayHandler_);
    this.adapter_.deregisterInputInteractionHandler('keydown', this.displayViaKeyboardHandler_);
    this.adapter_.deregisterInputInteractionHandler('keyup', this.displayViaKeyboardHandler_);
    this.adapter_.deregisterListInteractionHandler('click', this.listHandler_);
  }

  /** @param {?string} value */
  setInputValue(value) {
    this.getNativeInput_().value = value;
  }

  getValue() {
    return this.selectedIndex_ >= 0 ? this.adapter_.getValueForItemAtIndex(this.selectedIndex_) : '';
  }

  isDisabled() {
    return this.disabled_;
  }

  setDisabled(disabled) {
    const {DISABLED} = MDCExtAutocompleteFoundation.cssClasses;
    this.disabled_ = disabled;
    if (this.disabled_) {
      this.adapter_.addClass(DISABLED);
      this.adapter_.setAttr('aria-disabled', 'true');
    } else {
      this.adapter_.removeClass(DISABLED);
      this.adapter_.rmAttr('aria-disabled');
    }
  }

  /** @return {boolean} */
  isOpen() {
    return this.isOpen_;
  }

  addItems(items) {
    this.adapter_.removeAllItems();
    for (let i = 0, l = items.length; i < l; i++) {
      this.adapter_.addItem(items[i][this.valueField_], items[i][this.descriptionField_]);
    }
  }

  setValueField(value){
    this.valueField_ = value;
  }

  setDescriptionField(value){
    this.descriptionField_ = value;
  }

  refreshItems() {
    // if ((this.adapter_.getNumberOfAvailableItems() > 0) && !this.adapter_.isMenuOpen()) {
      this.open_();
    // }
  }

  resize() {
    // const font = this.adapter_.getComputedStyleValue('font');
    // const letterSpacing = parseFloat(this.adapter_.getComputedStyleValue('letter-spacing'));
    // if (font) {
    //   this.ctx_.font = font;
    // } else {
    //   const primaryFontFamily = this.adapter_.getComputedStyleValue('font-family').split(',')[0];
    //   const fontSize = this.adapter_.getComputedStyleValue('font-size');
    //   this.ctx_.font = `${fontSize} ${primaryFontFamily}`;
    // }
    //
    // let maxTextLength = 0;
    // for (let i = 0, l = this.adapter_.getNumberOfAvailableItems(); i < l; i++) {
    //   const txt = this.adapter_.getTextForItemAtIndex(i).trim();
    //   const {width} = this.ctx_.measureText(txt);
    //   const addedSpace = letterSpacing * txt.length;
    //   maxTextLength = Math.max(maxTextLength, Math.ceil(width + addedSpace));
    // }
    // this.adapter_.setStyle('width', `${maxTextLength}px`);
  }

  activateFocus_() {
    this.open_();
  }

  deactivateFocus_() {
    this.close_();
  }

  open_() {
    const {OPEN} = MDCExtAutocompleteFoundation.cssClasses;
    this.adapter_.addClass(OPEN);
    this.adapter_.setListElStyle('display', 'block');
    this.adapter_.selectPreviousAvailableItem();
    this.isOpen_ = true;

    // const focusIndex = this.selectedIndex_ < 0 ? null : this.selectedIndex_;
    // // const {left, top, transformOrigin} = this.computeMenuStylesForOpenAtIndex_(focusIndex);
    // const {left, top, transformOrigin} = this.computeMenuStylesForOpen_();
    //
    // this.adapter_.setMenuElStyle('left', left);
    // this.adapter_.setMenuElStyle('top', top);
    // this.adapter_.setMenuElStyle('transform-origin', transformOrigin);
    // this.adapter_.addClass(OPEN);
    // this.adapter_.openMenu(focusIndex);
  }

  close_() {
    const {OPEN} = MDCExtAutocompleteFoundation.cssClasses;
    this.adapter_.setListElStyle('display', 'none');
    this.adapter_.removeClass(OPEN);
    this.isOpen_ = false;
  }

  applyQuery_(value) {
    const {ARIA_HIDDEN} = MDCExtAutocompleteFoundation.strings;
    const {ITEM_NOMATCH} = MDCExtAutocompleteFoundation.cssClasses;
    for (let i = 0, l = this.adapter_.getNumberOfItems(); i < l; i++) {
      const txt = this.adapter_.getTextForItemAtIndex(i).trim();
      if (txt.toUpperCase().includes(value.toUpperCase())) {
        this.adapter_.rmClassForItemAtIndex(i, ITEM_NOMATCH);
        this.adapter_.rmAttrForItemAtIndex(i, ARIA_HIDDEN);
      }
      else {
        this.adapter_.addClassForItemAtIndex(i, ITEM_NOMATCH);
        this.adapter_.setAttrForItemAtIndex(i, ARIA_HIDDEN, 'true');
      }
    }
    this.refreshItems();
  }

  handleDisplayViaKeyboard_(evt) {
    // We use a hard-coded 2 instead of Event.AT_TARGET to avoid having to reference a browser
    // global.
    const EVENT_PHASE_AT_TARGET = 2;
    if (evt.eventPhase !== EVENT_PHASE_AT_TARGET) {
      return;
    }

    this.handleInputValue_();

    // Do nothing if Alt, Ctrl or Meta are pressed.
    if (evt.altKey || evt.ctrlKey || evt.metaKey) {
      return;
    }

    const {keyCode, key, shiftKey} = evt;
    const isTab = key === 'Tab' || keyCode === 9;
    const isArrowUp = key === 'ArrowUp' || keyCode === 38;
    const isArrowDown = key === 'ArrowDown' || keyCode === 40;

    // if (shiftKey && isTab) {
    //   this.adapter_.focusItemAtIndex(lastItemIndex);
    //   evt.preventDefault();
    //   return false;
    // }

    if (evt.type === 'keydown') {
      if (isArrowUp) {
        this.adapter_.selectPreviousAvailableItem();
      } else if (isArrowDown) {
        this.adapter_.selectNextAvailableItem();
      } else if (this.isOpen() && isTab) {
        let currentItem = this.adapter_.getSelectedItem();
        if (currentItem != null) {
          evt.preventDefault();
          this.lastValue_ = currentItem.textContent;
          this.setInputValue(this.lastValue_);
          this.close_();
        }
      }
    }

    //
    // const isOpenerKey = OPENER_KEYS.some(({key, keyCode, forType}) => {
    //   return evt.type === forType && (evt.key === key || evt.keyCode === keyCode);
    // });
    // if (isOpenerKey) {
    //   this.displayHandler_(evt);
    // }
  }

  handleInputValue_() {
    let currentValue = this.getNativeInput_().value;
    if (currentValue !== this.lastValue_) {
      this.lastValue_ = currentValue;
      // Debounce multiple changed values
      clearTimeout(this.changeValueTriggerTimerId_);
      this.changeValueTriggerTimerId_ = setTimeout(() => {
        if (this.adapter_.hasItemsLoader())
          this.adapter_.applyItemsLoader(currentValue);
        else {
          this.applyQuery_(currentValue);
        }
      }, numbers.CHANGE_VALUE_TRIGGER_DELAY);
    }
  }

  /**
   * @return {!InputElementState}
   * @private
   */
  getNativeInput_() {
    return this.adapter_.getNativeInput() || {
      disabled: false,
      value: null,
    };
  }

}
