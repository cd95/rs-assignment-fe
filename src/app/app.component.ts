import { Component, OnInit, VERSION } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppService } from './services/app.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  sources: any = [];
  templateDetails: any;
  registerForm!: FormGroup;
  fields: any = [];
  showForm: Boolean = false;
  model: any = {};

  constructor(private appService: AppService) {}

  ngOnInit(): void {
    this.appService.getTemplates().subscribe((res: any) => {
      console.log('response', res);
      res.templates.forEach((template: any) => {
        this.sources.push(template.type);
      });
      console.log('sources', this.sources);
    });
  }

  getFormControlsFields() {
    const formGroupFields: any = {};
    for (const field of Object.keys(this.model)) {
      const fieldProps = this.model[field];
      formGroupFields[field] = new FormControl(fieldProps.value, [
        Validators.required,
      ]);
      this.fields.push({ ...fieldProps, fieldName: field });
    }
    return formGroupFields;
  }

  buildForm() {
    const formGroupFields = this.getFormControlsFields();
    this.registerForm = new FormGroup(formGroupFields);
    console.log('fields', this.fields);
    console.log('formGroupFields', formGroupFields);
    this.showForm = true;
  }

  save() {
    console.log('formgroup', JSON.stringify(this.registerForm.value));
    let validationReponse = this.handleValidations(
      this.fields,
      this.registerForm.value
    );
    console.log('validations', validationReponse);
    if (validationReponse.validation == true) {
      let config = {
        templateId: this.templateDetails.id,
        userInput: validationReponse.userInput,
      };
      this.appService.saveConfiguration(config).subscribe((res: any) => {
        console.log('config', res);
        alert(JSON.stringify(res));
      });
    }
  }

  onChange(event: any) {
    console.log(event.target.value);
    if (event.target.value != 'Select Template') {
      this.model = Object.assign({}, {});
      this.fields = [];
      console.log('prev', this.model);
      this.registerForm = new FormGroup({});
      this.showForm = false;
      this.appService.getTemplate(event.target.value).subscribe((res: any) => {
        this.templateDetails = res;
        console.log('templateDetails', this.templateDetails);
        this.model = Object.assign({}, res.fields);
        this.buildForm();
      });
    }
  }

  handleValidations(fields: any, userInput: any) {
    console.log('inside handleValidations');
    console.log(fields);
    console.log(userInput);
    let errors = [];
    for (let field of fields) {
      if (
        field.type == 'input' &&
        field.required == true &&
        (userInput[field.fieldName] == null || userInput[field.fieldName] == '')
      ) {
        errors.push(`${field.fieldName} is required`);
      } else if (field.hasOwnProperty('regex')) {
        if (userInput[field.fieldName].match(field.regex) == false) {
          errors.push(field.regexErrorMessage);
        }
      } else if (
        field.type == 'checkbox' &&
        userInput[field.fieldName] == null
      ) {
        userInput[field.fieldName] = false;
      } else if (
        field.type == 'singleSelect' &&
        field.required == true &&
        userInput[field.fieldName] == null
      ) {
        errors.push(`${field.fieldName} is required`);
      }
    }
    console.log('errors', errors);
    console.log(userInput);
    if (errors.length == 0) {
      return { validation: true, userInput: userInput };
    }
    alert(errors);
    return { validation: false, userInput: userInput };
  }
}
