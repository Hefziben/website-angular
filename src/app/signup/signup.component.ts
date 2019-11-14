import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  user: any = {};
  States: any;
  model: any = {};
  fpass: boolean;
  success: boolean;
  state: boolean;
  check: boolean;
  loading: boolean;
  message = '';
  Countries: any;
  signupForm: FormGroup;
  submitted = false;

  constructor(private fb:FormBuilder) { 

      this.signupForm = fb.group({
        fname:["", Validators.required],
        lname: ["",Validators.required],
        add1: ["", Validators.required],
        add2: [""],
        company: [""],
        city: ["", Validators.required],
        country: ["", Validators.required],
        state: ["", Validators.required],
        zipcode: ["", Validators.required],
        tel: ["", Validators.required],
        fax: [""],
        email: ["", Validators.required],
        pass: ["", Validators.required],
        cpass: ["", Validators.required],
        });

  }

  ngOnInit() {
    this.getCountry();
   
  }
  
  get f() { return this.signupForm.controls; }

  
  getCountry() {
    fetch('https://www.m.licenseplates.tv/public/api/v1/auth/country')
    .then( (res: any) => {
      return res.json();
    })
    .then((myJson) => {
      console.log(JSON.stringify(myJson));
      this.Countries = myJson.countries;
      console.log(this.Countries);
    });
  }

  

  getState(event) {
    console.log(event);
    
    fetch('https://www.m.licenseplates.tv/public/api/v1/auth/state/' + event)
    .then( (res: any) => {
      return res.json();
    })
    .then((myJson) => {
      console.log(JSON.stringify(myJson));
      this.States = myJson.states;
      console.log(this.States);
    });
  }

  back() {
    this.model = {};
    this.fpass = !this.fpass;
  }

  resetPass() {
    this.success = true;
  }

  checkCountry(e) {
    console.log(e.target.value)
    // if (e.target.value == '38' || e.target.value == '38') {
    //   this.state = true;
    //   this.signupForm.value.country = e.target.value;
    //   return this.getState(e.target.value);
      
    // } else {
    //   this.state = false;
    // }
  }

  checkState(ngModel) {
    // this.user.state = val.target.value;
    // this.signupForm.value.state = this.user.state
    console.log(ngModel.value)
  }

  authCheck() {
    console.log('form');
   
    
    
  }

  onSubmit(){
    this.submitted = true;
    console.log(this.signupForm.value);
       // stop here if form is invalid
       if (this.signupForm.invalid) {
        return;
    }

    alert('SUCCESS!! :-)'
    
  }

}
