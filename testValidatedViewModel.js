/*
//
// TO RUN UNIT TESTS:
// > Include this script and ValidatedViewModel in a skeleton html document.
// > Open your browser's console to examine output.
// 
*/

var TestValidatedViewModel = function(config) {
	console.log('<test>');

	// 
	// testForErrors unit tests the given VM for validation errors
	// 
	// @param object vm is a knockout view model to test
	// @param object propToExpectedValidityMap is an object mapping property
	// names
	// to boolean-y values indicating whether the property should be
	// valid
	// @param boolean-y printConfirmationWhenTestPasses
	// @returns boolean true if there were errors, false if there were no errors
	//
	
//<testing utils>
	
	var numberOfTests = 0; 
	var testsPassed = 0;
	var testPassed = function(name, other, printConfirmationWhenTestPasses){
		numberOfTests++;
		testsPassed++;
		if("undefined" === typeof name){
			name='';
		}
		if (printConfirmationWhenTestPasses
				|| config.printConfirmationWhenTestsPass) {
			console.log( "+ " + numberOfTests + " : " + name+ " Test passed");

			if("undefined" !== typeof other){
				other = other.toString ? other.toString() : other;
				console.log(other);
			}
		}
	};
	
	var testFailed = function(name, other){
		numberOfTests++;
		if('undefined' === typeof name){
			name = '';
		}

		console.log("- " + numberOfTests + " : " + name +" Test Failed");
		if("undefined" !== typeof other){
			other = other.toString ? other.toString() : other;
			console.log(other);
		}
	};
	
	var testForErrors = function(vm, propToExpectedValidityMap,
			msg, printConfirmationWhenTestPasses) {
		if('undefined' === typeof msg){
			msg = 'Expected Validity';
		}
		var errors = false;
		for (prop in propToExpectedValidityMap) {
			if (vm[prop].isValid() != propToExpectedValidityMap[prop]) {
				console.log("for '" + prop + "', expected "
						+ Boolean(propToExpectedValidityMap[prop]) + " . Got "
						+ vm[prop].isValid());
				errors = true;
			}
		}
		if (errors) {
			console.dir(vm.errors());
			testFailed(msg);
		} else {
				testPassed(msg);	
		}
		return errors;
	};
	
	var testViewModelsForSameErrors = function(viewModelArray, propToExpectedValidityMap, printConfirmationWhenTestsPass){
		var allSame = true;
		var initialResult = testForErrors(viewModelArray[0], propToExpectedValidityMap);
		
		for( var i = 1; i < viewModelArray.length; i++){
			if(testForErrors(viewModelArray[i], propToExpectedValidityMap) !== initialResult){
				allSame = false;
			}
		}
		if(!allSame){
			testFailed("Identical View Models");
			ko.utils.arrayForEach(viewModelArray, 
					function(index, value){
						console.dir(value);
					}
			);
			console.log("\n");
		}
		else{
				testPassed("Identical View Models");
			}
		
		return allSame;
	};
	//wrapper for ko.applyBindings
    var applyKoBindings = function(viewModel){
        ko.applyBindings(viewModel, config.domElt);
    }

//</testing utils>
	var MyViewModel = ValidatedViewModel(function() {
		var self = this;
		
		//test validation on all validatable implementations of ko.subscribable
		self.prop1 = ko.observable();
		self.prop2 = ko.observableArray();
		self.prop3 = ko.computed(function() {
			/*
			var prop1 = ('undefined' === typeof prop1) ? '' : self.prop1();
			var prop2 = ('undefined' === typeof prop2) ? '' : self.prop2();
			if('' === prop1 && '' === prop2){
				return null;
			}
			*/
			return self.prop1() + " " + self.prop2()[0];
		});

		self.constraintGroups = {
			myAwesomeGroupZ : {
				prop1 : {
					required : true
				},
				prop2 : {
					minLength : 3,
					message : 'insufficient length'
				},
				prop3 : {
					equal : "HI there"
				}
			},
			dummy : {
				prop1 : {},
				prop2 : {},
				prop3 : {}
			},
			needy : {
				prop1: {required:true},
				prop2: {required:true},
				prop3: {equal: "thing1 thing2"}
			}
		};
		//test aliases 
		self.constraintGroups.jamesbond = self.constraintGroups.myAwesomeGroupZ;
		self.constraintGroups.dolly = self.constraintGroups.dummy;
		

		
		//test copy, and extend
		
		self.constraintGroups.jabba = ko.utils.extend({}, self.constraintGroups.myAwesomeGroupZ);//shallow copy
		//remove unwanted validation:
		delete self.constraintGroups.jabba.prop1;
		delete self.constraintGroups.jabba.prop3;
		//must copy existing requirements via extend because the children still point to myAwesomeGroupZ
		//add constraints
		self.constraintGroups.jabba.prop2 = ko.utils.extend({maxLength : 3}, self.constraintGroups.jabba.prop2);
		
	});
	var noErrorsVM = new MyViewModel();
	
	//will be updated with identical data, using an aliased constraint group:
	var noErrorsVMToo = new MyViewModel();
	
	var erringVM = new MyViewModel();

	//will be updated with identical data, using an aliased constraint group:
	var erringVMToo = new MyViewModel();

	var jabbaVM = new MyViewModel();
	ko.validation.init();
	applyKoBindings(noErrorsVM);
	noErrorsVM.applyConstraintGroup('dummy');
	
	applyKoBindings(noErrorsVMToo);
	noErrorsVMToo.applyConstraintGroup('dolly');
	
	noErrorsVMs = [noErrorsVM, noErrorsVMToo];
	
	// since there are no constraints in group 'dummy', everything should be
	// valid
	var allValid = {
			prop1 : 1,
			prop2 : 1,
			prop3 : 1
		};
	
	testForErrors(noErrorsVM, allValid);
	testViewModelsForSameErrors(noErrorsVMs, allValid);
	
	var testName = 'Object instead of function to ValidatedViewModel(func)';
	try{
		new ValidatedViewModel({});
		testFailed(testName);
	}
	catch(e){
		if(e instanceof TypeError){
			testPassed(testName);
		}
		else{
			testFailed( testName + "(" + e + ")");
		}
	}	
	
	testName = 'applyConstraintGroup call on viewModel that does not define constraintGroups';
	var EmptyViewModel = ValidatedViewModel(function(){;});
	var emptyViewModel = new EmptyViewModel(); 
	try{
		emptyViewModel.applyConstraintGroup('name irrelevant');
		testFailed(testName);
	}
	catch(e){
		testPassed(testName, e);
	}

	
	
	testName  = 'applyConstraintGroup when self.constraintGroups contains a non-existent property';
		
	var BadViewModel = ValidatedViewModel(
			function(){
				var self = this;
				self.something = ko.observable(3.14159);
				self.constraintGroups = { 
						'groupName' : {
							something : {required : true}
						}
				};
		
			}
	);
	
	myBad = new BadViewModel();
	delete myBad.something;
	try{
		myBad.applyConstraintGroup('groupName');
		testFailed(testName);
	}
	catch(e){
		testPassed(testName ,  e);
	}
	
	testName = "test removing a constraint group where the property has been clobbered with a non-subscribable";
	myBad = new BadViewModel();
	
	myBad.applyConstraintGroup('groupName');
	//now clobber:
	myBad.something = 42;
	try{
		myBad.removeConstraintGroup('groupName');
		testFailed(testName);
	}
	catch(e){
		testPassed(testName, e);
	}
	
	myBad = new BadViewModel();
	myBad.something = 42;
	testName = "apply constraint group to a property that doesn't implement subscribable";
	try{
		myBad.applyConstraintGroup('groupName');
		testFailed(testName);
	}
	catch(e){
		testPassed(testName, e);
	}
	
	testName = 'nonstring args to applyConstraintGroup';
	try{
		erringVM.applyConstraintGroup([]);
		testFailed(testName);
	}
	catch(e){
		testPassed(testName);
	}
	
	
	testName = "applyConstraintGroup without arguments";
	try {
		erringVM.applyConstraintGroup();
				testFailed(testName);
	} catch (e) {
		testPassed(testName);
	}// exception as expected
	
	testName = 'applyConstraintGroup with non-existent group name';
	try {
		erringVM.applyConstraintGroup('I do not exist');
		testFailed(testName);
	} catch (e) {
		testPassed(testName);
	} 

	//<atomic, don't re-order>
	testName  = 'applyConstraintGroup with valid group name';
	try {
		erringVM.applyConstraintGroup('myAwesomeGroupZ');
		testPassed(testName);
	} catch (e) {
		testFailed(testName);
	}
	testName = 'Throw error on multiple applications of the same constraint group to the same view model instance';
	try {
		erringVM.applyConstraintGroup('myAwesomeGroupZ');
		testFailed(testName);
	} catch (e) {
		testPassed(testName, e);
	}
	//</atomic, don't re-order>	
	
	testName = 'removeConstraintGroup with invalid group name';
	try{
		erringVM.removeConstraintGroup('Definitely dont exist');
		testFailed(testName);
	}
	catch(e){
		testPassed(testName, e);
	}
	
	testName = 'removeConstraintGroup with a valid but unapplied group name';
	try {
		erringVM.removeConstraintGroup('dummy');
		testFailed(testName);
	}
	catch(e){
		testPassed(testName, e);
	}
	
	testName = 'removeConstraintGroup when constraint groups have not been defined';
	myBad = new BadViewModel();
	
	delete myBad.constraintGroups;
	
	try{
		myBad.removeConstraintGroup('name is irrelevant');
		testFailed(testName);
	}
	catch(e){
		testPassed(testName, e);
	}
	
	
	applyKoBindings(erringVM);
	applyKoBindings(erringVMToo);
    erringVMToo.applyConstraintGroup('jamesbond');
	var errVMs = [erringVM, erringVMToo];
	// set all to fail:

	// (leave prop1 undefined to trigger 'required' error)

	// now push fewer items onto array than required by the validation
	// constraint
	erringVM.prop2.push('$%^&*');
	erringVMToo.prop2.push('$%^&*');
	
	var noValid = {
			prop1 : 0,
			prop2 : 0,
			prop3 : 0
		};
	testForErrors(erringVM, noValid);
	testViewModelsForSameErrors(errVMs, noValid);

	
	// these other unrelated view models should still pass with everything valid:
	testForErrors(noErrorsVM, allValid);
	testViewModelsForSameErrors(noErrorsVMs, allValid);

	// reset
	erringVM.prop2.splice(0);
	erringVMToo.prop2.splice(0);
	
	// set prop1, prop 2 to pass, but prop3 to fail
	erringVM.prop1("not HI");
	erringVMToo.prop1("not HI");
	a = erringVM.prop2;
	a.push('not there');
	a.push('you');
	a.push('silly');
	a.push('dog');

	a = erringVMToo.prop2;
	a.push('not there');
	a.push('you');
	a.push('silly');
	a.push('dog');
	var someValid = {
			prop1 : 1,
			prop2 : 1,
			prop3 : 0
		};
	testForErrors(erringVM, someValid);
	testViewModelsForSameErrors(errVMs, someValid);

	// these other unrelated view models should still pass with everything valid:
	testForErrors(noErrorsVM, allValid);
	testViewModelsForSameErrors(noErrorsVMs, allValid);
	
	// reset
	erringVM.prop1(undefined);
	erringVM.prop2.splice(0);
	erringVMToo.prop1(undefined);
	erringVMToo.prop2.splice(0);
	
	// set values to pass all:
	erringVM.prop1("HI");
	erringVMToo.prop1("HI");
	
	a = erringVM.prop2;
	a.push('there');
	a.push('you');
	a.push('sly');
	a.push('dog');
	
	a = erringVMToo.prop2;
	a.push('there');
	a.push('you');
	a.push('sly');
	a.push('dog');
	
	var allErr = {
			prop1 : 1,
			prop2 : 1,
			prop3 : 1
		};
	
	testForErrors(erringVM, allErr);
	
	testViewModelsForSameErrors(errVMs, allErr);

	// these other unrelated view models should still pass with everything valid:
	testForErrors(noErrorsVM, allValid);
	testViewModelsForSameErrors(noErrorsVMs, allValid);

	
	//now test the aliased, derived vm:

	
	//now test the aliased, derived vm:
	applyKoBindings(jabbaVM);
	jabbaVM.applyConstraintGroup('jabba');
	
	
	
	testForErrors(jabbaVM, {prop2: 0});
	a = jabbaVM.prop2;
	a.push('one');
	a.push('two');
	a.push('three');
	testForErrors(jabbaVM, {prop2: 1});
	a.push('four');
	testForErrors(jabbaVM, {prop2: 0});
	
	//test a shifty model... his constraints keep appearing and disappearing.
	var shifty =  new MyViewModel();
	applyKoBindings(shifty);
	shifty.applyConstraintGroup('needy');
	testForErrors(shifty, noValid);
	shifty.removeConstraintGroup('needy');
	testForErrors(shifty, allValid);
	shifty.applyConstraintGroup('myAwesomeGroupZ');
	testForErrors(shifty, noValid);
	
	shifty.prop1("HI");
	a = shifty.prop2;
	a.push("there");
	a.push("a");
	a.push("b");

	testForErrors(shifty, allValid);
	//test case where values have actually been modified between application+validation and removal
	shifty.removeConstraintGroup('myAwesomeGroupZ');
	testForErrors(shifty, allValid);
	
	
	//test to see if manual, group-less extension is affected by the constraint groups:
	//reset view model
	
	shifty = new MyViewModel();
	//before constraint groups applied
	shifty.prop1.extend({maxLength: 2, minLength: 2});
	shifty.prop1("1");
	testForErrors(shifty, {prop1: false});
	
	shifty.applyConstraintGroup('myAwesomeGroupZ');

	//after constraint groups applied:
	
	//test invalid detection
	testForErrors(shifty, noValid);
	
	//test valid detection
	shifty.prop1("HI");
	
	a = shifty.prop2;
	a.push("there");
	a.push("a");
	a.push("b");
	
	testForErrors(shifty, allValid);
	
	
	shifty.removeConstraintGroup('myAwesomeGroupZ');
	//test valid detection after constraint group removal
	testForErrors(shifty, {prop1: 1});
	//test invalid detection after constraint group removal
	shifty.prop1("1");
	testForErrors(shifty, {prop1: 0});
	
	shifty.applyConstraintGroup('myAwesomeGroupZ');
	/*
     *find the errors induced by the particular constraints and contraint groups
     *referenced in url:
      https://github.com/carlschroedl/validatedviewmodel/issues/1
     */
    testName = "Test removal of constraint groups with a different kind of constraintGroup syntax";

    var Bug1VVM = ValidatedViewModel(function(){
        var self = this;
        self.a = ko.observable("a");
        self.b = ko.observable();
        self.constraintGroups = {
            basic : {
                a : {
                    required: true,
                    message: 'This is required'
                }
            },
            advanced : {
                b : {
                    required: {
                        message: 'this is also required'
                    },
                    pattern: {
                        message: 'Must match the pattern',
                        params: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/
                    }
                }
            }
        };
    });
    
    var b1vvm = new Bug1VVM();
    applyKoBindings(b1vvm);
    b1vvm.applyConstraintGroups(['basic', 'advanced']);
    b1vvm.removeConstraintGroup('advanced');
    if( 0 !== b1vvm.errors().length){
        testFailed(testName);
    }
    else{
        testPassed(testName);
    }

	console.log('PASSED ' + testsPassed + '/' + numberOfTests + ' TESTS.');
	console.log('</test>');
};

window.onload=function(){
    //setup dummy element for applyBindings calls
    //if no element is supplied, ko.validation throws errors
    var body = document.getElementsByTagName('body')[0];
    var p = document.createElement('p');
    body.appendChild(p);

testValidatedViewModel({
    domElt: p,
	printConfirmationWhenTestsPass : true
});
};
