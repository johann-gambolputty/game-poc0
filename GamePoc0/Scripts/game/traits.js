var Maybe;
(function (Maybe) {
    function to(item) {
        return item == null ? empty() : new MaybeImpl(item);
    }
    Maybe.to = to;
    function empty() {
        return new MaybeImpl(null);
    }
    Maybe.empty = empty;
    var MaybeImpl = (function () {
        function MaybeImpl(item) {
            this.item = item;
        }
        MaybeImpl.prototype.do = function (action) {
            if (this.item != null) {
                action(this.item);
            }
        };
        MaybeImpl.prototype.map = function (mapper) {
            return this.item == null ? Maybe.empty() : Maybe.to(mapper(this.item));
        };
        MaybeImpl.prototype.mapOr = function (mapper, defaultValue) {
            return this.item == null ? defaultValue : mapper(this.item);
        };
        MaybeImpl.prototype.isEmpty = function () {
            return this.item == null;
        };
        MaybeImpl.prototype.get = function () {
            if (this.item == null) {
                throw "Access to empty maybe";
            }
            return this.item;
        };
        return MaybeImpl;
    })();
})(Maybe || (Maybe = {}));
var TraitType = (function () {
    function TraitType(name) {
        this.name = name;
    }
    return TraitType;
})();
var TraitContainerBuilder = (function () {
    function TraitContainerBuilder(type, factory, apply) {
        this.type = type;
        this.factory = factory;
        this.apply = apply;
    }
    TraitContainerBuilder.prototype.addTrait = function (type, factory) {
        var _this = this;
        return new TraitContainerBuilder(type, factory, function (c) { return c.addTrait(_this.type, _this.factory()); });
    };
    TraitContainerBuilder.prototype.build = function () {
        var tc = new TraitContainer();
        tc.addTrait(this.type, this.factory());
        this.apply(tc);
        return tc;
    };
    return TraitContainerBuilder;
})();
var NullTraitContainerBuilder = (function () {
    function NullTraitContainerBuilder() {
    }
    NullTraitContainerBuilder.prototype.addTrait = function (type, factory) {
        return Traits.buildTrait(type, factory);
    };
    NullTraitContainerBuilder.prototype.build = function () {
        return new TraitContainer();
    };
    return NullTraitContainerBuilder;
})();
var Traits;
(function (Traits) {
    function buildTrait(type, factory) {
        return new TraitContainerBuilder(type, factory, function (_) { });
    }
    Traits.buildTrait = buildTrait;
    function noTraits() {
        return new NullTraitContainerBuilder();
    }
    Traits.noTraits = noTraits;
})(Traits || (Traits = {}));
;
var TraitContainer = (function () {
    function TraitContainer() {
        this.traits = {};
    }
    TraitContainer.prototype.trait = function (type) {
        var t = this.traits[type.name];
        return Maybe.to(t);
    };
    TraitContainer.prototype.safeTrait = function (type) {
        var t = this.traits[type.name];
        if (t == null) {
            throw "Unable to find trait of type " + type.name;
        }
        return t;
    };
    TraitContainer.prototype.hasTrait = function (type) {
        return this.traits[type.name] != null;
    };
    TraitContainer.prototype.ensureTrait = function (type, createTrait) {
        var t = this.traits[type.name];
        if (t == null) {
            t = createTrait();
            this.traits[type.name] = t;
        }
        return t;
    };
    TraitContainer.prototype.addTrait = function (type, trait) {
        this.traits[type.name] = trait;
        return this;
    };
    TraitContainer.prototype.removeTraitOfType = function (type) {
        this.traits[type.name] = null;
        return this;
    };
    return TraitContainer;
})();
//# sourceMappingURL=traits.js.map