/**
 * This function creates a ValidatedViewModel Class by adding the appropriate methods.
 * ValidatedViewModel Classes permit you to apply context-sensitive constraintGroups
 * to instances of the class.
 * 
 * @param function
 *            viewModel the POJO Knockout-JS style viewModel function that you
 *            would normally write. This object must already have
 *            ko.observable*s|computed's assigned to the desired properties.
 *
 *            In addition, the function must contain a publicly-accesible 
 *            property called 'constraintGroups'. The property must be a map of
 *            group names to constraint group definitions. Constraint group
 *            definitions are maps of property names to constraint definitions.
 *            Constraint definitions are objects identical to that which would 
 *            be passed as an argument to a 
 *            (implements ko.subscribable()).extend() for the 
 *            Knockout-Validation plugin.
 * 
 * @url https://github.com/ericmbarnard/Knockout-Validation/wiki/Native-Rules
 * @author cschroedl@xes-inc.com
 * @example
 * // -------------------------------------------------------------------
 * //src: myModelDefinitions.js
 * 
 * var MyViewModel = ValidatedViewModel(function(){ 
 * var self = this; 
 * self.prop1 = ko.observable();
 * self.prop2 = ko.computed(function(...){...});
 * self.prop3 = ko.observableArray();
 * 
 * self.constraintGroups = { 
 * 		yourGroupNameHere : 
 * 			{
 * 				prop1 : {required: true},
 *	 			prop2 : {pattern: '^[a-z0-9].$'}, 
 *				prop3 : {minLength: 3, message:'insufficient length'}
 *			}
 * 	};
 * 
 * });
 * // -------------------------------------------------------------------
 * //src: myPageSpecificStuff.js
 * 
 * //must run this method before applying any constraint groups
 * ko.validation.init();
 * var instanceOfMyViewModel = new MyViewModel();
 * instanceofMyViewModel.applyConstraintGroup('yourGroupNameHere');
 * //rest of validation code here
 * // -------------------------------------------------------------------
 */
var ValidatedViewModel = function(ViewModelFunc) {
	
	if ('function' !== typeof ViewModelFunc) {
		throw new TypeError(
				"the supplied viewModel must be of type function. '"
				+ typeof viewModel + "' given.");
	}


		/**
		 * @deprecated - this method was a safe way of updating the (property
		 *             name -> constraint) map. This function now assumes that
		 *             the developer will properly format self.constraintGroups
		 * 
		 * registers a map of property names to constraint specification
		 * objects. Fails if a group of the same name has already been
		 * registered, or if the given name is not a string.
		 * 
		 * @param string
		 *            name for the constraint group
		 * @param propToConstraintMap -
		 *            a map of view model property names to objects containing
		 *            their validation constraint specifications. The
		 *            specification must be identical to that which would be
		 *            passed as an argument to ko.observable().extend() for the
		 *            Knockout-Validation plugin.
		 * 
		 * @url https://github.com/ericmbarnard/Knockout-Validation/wiki/Native-Rules
		 * 
		 * @returns void
		 * @author  cschroedl@xes-inc.com
		 */
	/*
	 * var addConstraintGroup = function(name, propToConstraintMap){
	 * if("undefined" == typeof self.constraintGroups[name]){//if key is yet
	 * unused if(name instanceof String || name.constructor === String){
	 * self.constraintGroups[name] = propToConstraintMap; } else{ throw new
	 * TypeError("'name' must be of type String." + typeof name +" given."); } }
	 * else{ //key is already used throw new Error("a constraint group named '" +
	 * name + "' already exists"); } };
	 */

	/**
	 * Applies the specified validation constraint group to the view model. This
	 * function may not be called in your viewModel's constructor. The
	 * application of multiple constraint groups does not eliminate or overwrite
	 * the constraint definitions of preiviously applied constraint groups.
	 * 
	 * @param name
	 *            string - name of the view model
	 * 
	 * @param config
	 *            Object - optional argument that is passed as the second
	 *            argument to ko.validation.group();
	 * @url https://github.com/ericmbarnard/Knockout-Validation/wiki/Configuration
	 *      (see Option "grouping")
	 * @returns void
	 * @author  cschroedl@xes-inc.com
	 */

	ViewModelFunc.prototype.applyConstraintGroup = function(name, config) {

		if (name instanceof String || name.constructor === String) {
			if ("undefined" === typeof this.constraintGroups
					|| 'object' != typeof this.constraintGroups) {
				throw new Error(
						"Validated View Models must define a this.constraintGroups object. No such object detected.");
			}


			if ("undefined" === typeof this.constraintGroups[name]) {// if key is
				// yet
				// registered
				throw new Error(
						"This view model has no registered constraint group named '"
								+ name
								+ "'. Correct the name or register a new constraint group in this.constraintGroups");
			} else {
				//initialize if necessary::
				if('undefined' === typeof this.appliedConstraintGroups){
					this.appliedConstraintGroups = new Array();
				}
				//check for previous application of group
				if (-1 === this.appliedConstraintGroups.indexOf(name)) {
					this.appliedConstraintGroups.push(name);
				} else {
					// if group has already been applied,
					throw new Error("The Constraint Group '" + name
							+ "' has already been applied to this model.");
				}
				for (propertyName in this.constraintGroups[name]) {

					var prop = this[propertyName];

					var constraints = this.constraintGroups[name][propertyName];
					if ('undefined' == typeof prop) {
						throw new Error("Property '" + propertyName
								+ "' was not found in this view model");
					}

					if (!(prop instanceof ko.subscribable.constructor)) {
						// if this is not a ko.observable(Array) or a
						// ko.computed
						throw new TypeError(
								"Property '"
										+ propertyName
										+ "' must be a ko.observable(Array) or a ko.computed to be validated.");
					}

					// add the constraints to the view model property
					prop.extend(constraints);

				}
				;
				this['errors'] = ko.validation.group(this, config);
			}

		} else {
			throw new TypeError(
					"a string must be used to specify a registered constraint");
		}
	};
	

	
	/**
	 * Applies all of the specified constraint groups to the model in the same
	 * order that they were specified.
	 * 
	 * @param groupNames 
	 *            array of string constraint group names
	 * @param config 
	 * 		object - see applyConstraintGroup documentation
	 * @author  cschroedl@xes-inc.com
	 */

	ViewModelFunc.prototype.applyConstraintGroups = function(groupNames, config) {
		for ( var i = 0; i < groupNames.length; ++i) {
			this.applyConstraintGroup(groupNames[i], config);
		}
	};
	
	

	
		/**
		 * Removes the specified constraint from the specified property
		 * 
		 * @param constraintName
		 *            string - the name of the constraint. Ex: "required",
		 *            "max", etc.
		 * 
		 * @param constraintParameters
		 *            mixed - the value of the parameter passed to the
		 *            constraint. Ex: 'true' in {required: true}. '42' in {max:
		 *            42}
		 * 
		 * @param propertyName
		 *            string- the name of the property to remove the constraint
		 *            from
		 * 
		 * @returns boolean - true if the constriant 'constraintName' was
		 *          deleted from property 'propertyName'. false if the
		 *          constraint was not found.
		 * @author  cschroedl@xes-inc.com
		 */
	ViewModelFunc.prototype.removeConstraintFromProperty = function(
			constraintName, constraintParameters, propertyName) {
		if(this[propertyName] instanceof ko.subscribable.constructor){
			var rules = this[propertyName].rules();	
		}
		else{
			throw new Error("Property '" + propertyName + "' does not implement ko.subscribable");
		}
		
		if ('undefined' === typeof rules) {
			throw new ReferenceError("Property '" + propertyName
					+ "' does not exist");
		}
		
		// CHANGE: jspradlin - 2013-02-06 -
		// Altered behavior from core library. The params were not properly compared.
		// This caused a bug where the validation rules were never cleared. 
		// In ko.validation rules are added in the addExtender method. The params are transformed
		// during this process. For example a required rule will automatically create a param = true.
        // In order to do a valid comparison, the same object must be constructed using those rules
        // in order compare with the 'params' stored in the constraint parameters 
        
        // Transform the parameters to the format they would be after the call to addExtender
        var paramValues = constraintParameters; 
        if(constraintParameters.message || constraintParameters.onlyIf){
            paramsValues = (constraintParameters.params === undefined || 
                          constraintParameters.params === null || 
                          constraintParameters.params === "") ? 
              true : 
              constraintParameters.params; 
        }
        		
		var found = false;
		for ( var i = 0; i < rules.length; i++) {
		    
		    var rule = rules[i]; 
		    // Conver the string "true" to a proper boolean for comparison
		    var ruleParams = rule.params === "true" ? true : rule.params;
			
			// Convert the string "false" to a proper boolean for comparison
			ruleParams = ruleParams === "false" ? false: ruleParams; 
		    
            // The params for the pattern rule can be reqular expressions
			// If the parameter is not already a string, convert it to one for
			// proper comparison. Do this for the rule's parameter and the 
			// constrainParam stored in the configuration group
            if(constraintName === "pattern"){
                if(ruleParams && typeof(ruleParams) != "string"){
                    ruleParams = ruleParams.source;  
                }
                if(paramsValues && typeof(paramsValues) != "string"){
                    paramsValues = paramsValues.source;
                }
            }
            
			// Check to see if this rule should be removed
			if (rule.rule === constraintName && ruleParams == paramsValues){
				found = true;
				rules.splice(i, 1);
				i -=1; // reduce the index to make sure last entry is not skipped.
				// Change: jspradlin - removed this break to allow removing of ALL matches for constraint name
				// For some reason I was seeing multiple rules being added in knockout.validation's internal rules collection
				
				// break; 
				// don't continue deleting any additional occurences of this
				// constraint. Hence if applyConstraintGroups permitted multiple
				// applications of constraint groups, N applications of the
				// same constraint group would require N calls to
				// removeConstraintGroup
			}
		}

		return found;
	};

	/**
	 * Removes the named constraint group. Throws errors if constraint group
	 * does not not exist, or if the constraint group is not currently applied.
	 * 
	 * @param constraintGroupName
	 *            string constraint group name
	 * @author cschroedl@xes-inc.com
	 */
	
	ViewModelFunc.prototype.removeConstraintGroup = function(constraintGroupName){
		//ensure constraintGroups are still defined
		if('undefined' === typeof this.constraintGroups){
			throw new ReferenceError('Cannot remove the constraint group- no constraint groups have been defined');
		}
		//create local alias 
		var constraintGroup = this.constraintGroups[constraintGroupName];
		//check for bad constraint group name
		if('undefined' === typeof constraintGroup){
			throw new ReferenceError("Constraint group '" + constraintGroupName + "' does not exist");
		}
		//now that we know the constraint group exists, check to see if it has been applied
		
		//after checking to see that the appliedConstraintGroups property exists:
			if('undefined' === typeof this.appliedConstraintGroups){
				//then no constraintGroups have been applied
				throw new Error("Constraint group '" + constraintGroupName + "' is not currently applied.");
			}
		if(-1 === this.appliedConstraintGroups.indexOf(constraintGroupName)){
			throw new Error("Constraint group '" + constraintGroupName + "' is not currently applied.");
		}

		for(propertyName in constraintGroup){
			var constraintDefinitions = constraintGroup[propertyName];
			for(ruleName in constraintDefinitions){
				this.removeConstraintFromProperty(ruleName, constraintDefinitions[ruleName], propertyName);
			}
			//now force validation to occur again
			//unfortunately, this inefficiently notifies all 
			//subscribers instead of just the validation handlers

			//@todo only trigger the subscribed validation handlers  

			this[propertyName].notifySubscribers(this[propertyName]());
		}
		ko.utils.arrayRemoveItem(this.appliedConstraintGroups, constraintGroupName);
	};
	// return the newly-equipped View Model "class"
	return ViewModelFunc;
};

/*
// ///////////////////////////////////////////////////////////////////////////////////////////
//
// TO RUN UNIT TESTS:
// 
// > include this script in your document.
// > copy everything between '//<test>' and '//</test>' into a document ready
// 		function
// > set the parameterized config values appropriately
//
// ///////////////////////////////////////////////////////////////////////////////////////////

// <test>
TestValidatedViewModel({
	aDOMElementIDWithoutChildrenAndWithoutKOBindings : "submit",
	printConfirmationWhenTestsPass : true
});
// </test>
//DO NOT COPY ANYTHING BELOW THIS LINE 
//*/

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
	ko
			.applyBindings(
					noErrorsVM,
					document
							.getElementById(config.aDOMElementIDWithoutChildrenAndWithoutKOBindings));
	noErrorsVM.applyConstraintGroup('dummy');
	
	ko
	.applyBindings(
			noErrorsVMToo,
			document
					.getElementById(config.aDOMElementIDWithoutChildrenAndWithoutKOBindings));
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
	
	
	ko
			.applyBindings(
					erringVM,
					document
							.getElementById(config.aDOMElementIDWithoutChildrenAndWithoutKOBindings));
		ko
			.applyBindings(
					erringVMToo,
					document
							.getElementById(config.aDOMElementIDWithoutChildrenAndWithoutKOBindings));
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
	ko
			.applyBindings(
					jabbaVM,
					document
							.getElementById(config.aDOMElementIDWithoutChildrenAndWithoutKOBindings));
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
	ko
	.applyBindings(
			shifty,
			document
					.getElementById(config.aDOMElementIDWithoutChildrenAndWithoutKOBindings));

	
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
	
	console.log('PASSED ' + testsPassed + '/' + numberOfTests + ' TESTS.');
	console.log('</test>');
};
