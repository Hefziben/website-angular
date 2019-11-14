import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from "../lib/service/auth/auth.service";
import { Alert } from 'selenium-webdriver';
import { throwMatDuplicatedDrawerError } from '@angular/material';
import { Router } from '@angular/router';
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
  errors = false;
  passMatch = true;

  constructor(private fb:FormBuilder, private auth:AuthService, private router: Router) { 

      this.signupForm = fb.group({
        fname:["", Validators.required],
        lname:["",Validators.required],
        address:["", Validators.required],
        address2:[""],
        company:[""],
        city:["", Validators.required],
        country:["", Validators.required],
        state:["", Validators.required],
        zipcode:["", Validators.required],
        telephone:["", Validators.required],
        email:["", Validators.required],
        pass:["", Validators.required],
        cpass:["", Validators.required],
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
    
       // stop here if form is invalid
       if (this.signupForm.invalid) {
         this.errors = true;
        return;
    } if (this.signupForm.value.pass !== this.signupForm.value.cpass){
      this.errors = true;
      this.passMatch = false;      
    } else{
      const params = {
      
        fname:this.signupForm.value.fname,
        lname:this.signupForm.value.lname,
        address:this.signupForm.value.address,
        address2:this.signupForm.value.address2,
        company:this.signupForm.value.company,
        city:this.signupForm.value.city,
        country:this.signupForm.value.country,
        state:this.signupForm.value.state,
        zipcode:this.signupForm.value.zipcode,
        telephone:this.signupForm.value.telephone,
        email:this.signupForm.value.email,
        pass:this.signupForm.value.pass,

      };

      console.log(params);
      this.errors = false;
      this.passMatch = true;
      this.auth.signUp(params).subscribe(res=>{
        console.log(res);
        const response = res['success'];
        const message = res['message']
        if (response == 0) {          
          alert(message);   
        } else {
          console.log('SUCCESS!! :-)');
          this.signupForm.reset();
          alert(message);  
          this.router.navigate(['/login']);
          
        }
        
       
        
        
      })
      
    }
  
   
    
  }

}
