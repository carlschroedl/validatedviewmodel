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
 *         yourGroupNameHere : 
 *             {
 *                 prop1 : {required: true},
 *                 prop2 : {pattern: '^[a-z0-9].$'}, 
 *                prop3 : {minLength: 3, message:'insufficient length'}
 *            }
 *     };
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
     *         object - see applyConstraintGroup documentation
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
        var found = false;
        for ( var i = 0; i < rules.length; i++) {
            if (rules[i].rule === constraintName
                    && rules[i].params == constraintParameters) {
                found = true;
                rules.splice(i, 1);
                break;
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
