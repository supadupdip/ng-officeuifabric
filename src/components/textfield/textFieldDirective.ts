import * as angular from 'angular';

import { InputTypeEnum } from './uifTypeEnum';

/**
 * @ngdoc interface
 * @name ITextFieldScope
 * @module officeuifabric.components.textfield
 *
 * @description
 * This is the scope used by the directive.
 *
 * uifLabel and placeholder cannot be set at the same time! When both values are set, placeholder will be ignored.
 *
 * @property {string} uifLabel        - The label to display next to the text field
 * @property {string} placeholder     - A placeholder to display over the input. Will hide as soon as a user clicks on the input.
 * @property {string} uifDescription  - A longer text description to display below the text field
 * @property {string} ngModel         - The scope variable to bind to the text input.
 * @property {string} ngChange        - The expression to evaluate when the ngModel changes
 * @property {InputTypeEnum} uifType  - The type of the text field
 * @property {boolean} uifMultiline   - If true, textbox will be rendered as a multiline text area
 *
 */
export interface ITextFieldScope extends angular.IScope {
  uifLabel: string;
  uifIconLabel: string;
  placeholder: string;
  uifDescription: string;
  ngModel: string;
  ngChange: string;
  uifType: InputTypeEnum;
  uifMultiline: boolean;
  max: string;
  min: string;
  step: string;

  labelShown: boolean;
  uifUnderlined: boolean;
  inputFocus: (ev: any) => void;
  inputBlur: (ev: any) => void;
  inputChange: (ev: any) => void;
  labelClick: (ev: any) => void;
  isActive: boolean;
  required: boolean;
  disabled: boolean;
}

/**
 * @ngdoc interface
 * @name ITextFieldAttributes
 * @module officeuifabric.components.textfield
 *
 * @description
 * This is the attribute interface used by the directive.
 *
 * @property {InputTypeEnum} uifType - The type of the text field
 * @property {string} uifMultiline   - If true, textbox will be rendered as a multiline text area
 *
 */
export interface ITextFieldAttributes extends angular.IAttributes {
  uifType: InputTypeEnum;
  uifMultiline: string;
}

/**
 * @controller
 * @name TextFieldController
 * @private
 * @description
 * Used to more easily inject the Angular $log service into the directive.
 */
class TextFieldController {
  public static $inject: string[] = ['$log'];
  constructor(public $log: angular.ILogService) {
  }
}

/**
 * @ngdoc directive
 * @name uifTextfield
 * @module officeuifabric.components.textfield
 *
 * @restrict E
 *
 * @description
 * `<uif-textfield>` is a textfield directive.
 *
 * @see {link http://dev.office.com/fabric/components/textfield}
 *
 * @usage
 *
 * <uif-textfield uif-label='This is the label'
 *                uif-description='This is the description'
 *                uif-Underlined
 *                placeholder='This is the placeholder' />
 */
export class TextFieldDirective implements angular.IDirective {
  public controller: typeof TextFieldController = TextFieldController;

  public template: string =
  '<div ng-class="{\'is-active\': isActive, \'ms-TextField\': true, ' +
  '\'ms-TextField--underlined\': uifUnderlined, \'ms-TextField--placeholder\': placeholder, ' +
  '\'is-required\': required, \'is-disabled\': disabled, \'ms-TextField--multiline\' : uifMultiline }">' +
  '<label ng-show="labelShown" class="ms-Label" ng-click="labelClick()"><i class="ms-Icon ms-Icon--{{uifIconLabel}}" ng-if="uifIconLabel" aria-hidden="true"></i>{{uifLabel || placeholder}}</label>' +
  '<input ng-model="ngModel" ng-change="inputChange()" ng-blur="inputBlur()" ng-focus="inputFocus()" ng-click="inputClick()" ' +
  'class="ms-TextField-field" ng-show="!uifMultiline" ng-disabled="disabled" type="{{uifType}}"' +
  'min="{{min}}" max="{{max}}" step="{{step}}" />' +
  '<textarea ng-model="ngModel" ng-blur="inputBlur()" ng-focus="inputFocus()" ng-click="inputClick()" ' +
  'class="ms-TextField-field" ng-show="uifMultiline" ng-disabled="disabled"></textarea>' +
  '<span class="ms-TextField-description">{{uifDescription}}</span>' +
  '</div>';
  public scope: {} = {
    max: '@',
    min: '@',
    ngChange: '=?',
    ngModel: '=?',
    placeholder: '@',
    step: '@',
    uifDescription: '@',
    uifLabel: '@',
    uifType: '@'
  };

  public require: string[] = ['uifTextfield', '?ngModel'];

  public restrict: string = 'E';
  public static factory(): angular.IDirectiveFactory {
    const directive: angular.IDirectiveFactory = () => new TextFieldDirective();

    return directive;
  }

  public link(
    scope: ITextFieldScope, instanceElement: angular.IAugmentedJQuery,
    attrs: ITextFieldAttributes, controllers: any[]): void {

    let controller: TextFieldController = controllers[0];
    let ngModel: angular.INgModelController = controllers[1];

    scope.disabled = 'disabled' in attrs;
    scope.$watch(
      () => { return instanceElement.attr('disabled'); },
      ((newValue) => { scope.disabled = typeof newValue !== 'undefined'; })
    );
    scope.labelShown = true;
    scope.required = 'required' in attrs;
    scope.uifMultiline = attrs.uifMultiline === 'true';
    scope.uifType = attrs.uifType;
    scope.$watch(
      'uifType',
      (newValue: string, oldValue: string) => {
        if (typeof newValue !== 'undefined') {
          // verify a valid type was passed in
          if (InputTypeEnum[newValue] === undefined) {
            controller.$log.error('Error [ngOfficeUiFabric] officeuifabric.components.textfield - Unsupported type: ' +
              'The type (\'' + scope.uifType + '\') is not supported by the Office UI Fabric. ' +
              'Supported options are listed here: ' +
              'https://github.com/ngOfficeUIFabric/ng-officeuifabric/blob/master/src/components/textfield/uifTypeEnum.ts');
          }
        } else {
          // default value
          scope.uifType = InputTypeEnum.text;
        }
      }
    );
    scope.uifUnderlined = 'uifUnderlined' in attrs;
    scope.inputFocus = function (ev: any): void {
      if (scope.placeholder) {
        scope.labelShown = false;
      }
      scope.isActive = true;
    };
    scope.inputBlur = function (ev: any): void {
      let input: JQuery = instanceElement.find('input');
      if (scope.placeholder && input.val().length === 0) {
        scope.labelShown = true;
      }
      scope.isActive = false;

      if (angular.isDefined(ngModel) && ngModel != null) {
        ngModel.$setTouched();
      }
    };
    scope.labelClick = function (ev: any): void {
      if (scope.placeholder) {
        let input: JQuery = scope.uifMultiline ? instanceElement.find('textarea')
          : instanceElement.find('input');
        input[0].focus();
      }
    };

    scope.inputChange = function (ev: any): void {
      if (angular.isDefined(ngModel) && ngModel != null) {
        ngModel.$setDirty();
      }
    };

    if (ngModel != null) {
      ngModel.$render = () => {
        // when setting the ngModel value programmatically,
        // hide the placeholder when viewvalue is not empty
        if (scope.placeholder) {
          scope.labelShown = !ngModel.$viewValue;
        }
      };
    }
  }
}

/**
 * @ngdoc module
 * @name officeuifabric.components.textfield
 *
 * @description
 * Textfield
 *
 */
export let module: angular.IModule = angular.module('officeuifabric.components.textfield', [
  'officeuifabric.components'
])
  .directive('uifTextfield', TextFieldDirective.factory());
