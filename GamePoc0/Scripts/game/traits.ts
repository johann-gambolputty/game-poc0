
interface IMaybe<T> {
    do(action: (i: T) => void);
    map<R>(mapper: (i: T) => R): IMaybe<R>;
    mapOr<R>(mapper: (i: T) => R, defaultValue: R): R;
    isEmpty(): boolean;
    get(): T;
}

module Maybe {
    export function to<T>(item: T): IMaybe<T> {
        return item == null ? empty<T>() : new MaybeImpl<T>(item);
    }
    export function empty<T>(): IMaybe<T> {
        return new MaybeImpl<T>(null);
    }

    class MaybeImpl<T> implements IMaybe<T> {

        constructor(public item: T) {
        }
        do(action: (i: T) => void) {
            if (this.item != null) {
                action(this.item);
            }
        }
        map<R>(mapper: (i: T) => R): IMaybe<R> {
            return this.item == null ? Maybe.empty<R>() : Maybe.to(mapper(this.item));
        }
        mapOr<R>(mapper: (i: T) => R, defaultValue: R): R {
            return this.item == null ? defaultValue : mapper(this.item);
        }
        isEmpty(): boolean {
            return this.item == null;
        }
        get(): T {
            if (this.item == null) {
                throw "Access to empty maybe";
            }
            return this.item;
        }
    }

}

class TraitType<T> {
    constructor(public name: string) {
    }
}

interface ITraitContainerBuilder {
    addTrait<T>(type: TraitType<T>, factory: () => T): ITraitContainerBuilder;
    build(): TraitContainer;
}

class TraitContainerBuilder<T> implements ITraitContainerBuilder {
    constructor(private type: TraitType<T>, private factory: () => T, private apply: (container: TraitContainer) => void) {
    }
    addTrait<TNext>(type: TraitType<TNext>, factory: () => TNext): ITraitContainerBuilder {
        return new TraitContainerBuilder<TNext>(type, factory, c => c.addTrait(this.type, this.factory()));
    }
    build(): TraitContainer {
        var tc = new TraitContainer();
        tc.addTrait(this.type, this.factory());
        this.apply(tc);
        return tc;
    }
}

class NullTraitContainerBuilder implements ITraitContainerBuilder {
    addTrait<T>(type: TraitType<T>, factory: () => T): ITraitContainerBuilder {
        return Traits.buildTrait(type, factory);
    }
    build(): TraitContainer {
        return new TraitContainer();
    }
}

module Traits {
    export function buildTrait<T>(type: TraitType<T>, factory: () => T): ITraitContainerBuilder {
        return new TraitContainerBuilder(type, factory, _ => { });
    }
    export function noTraits(): ITraitContainerBuilder {
        return new NullTraitContainerBuilder();
    }
};

class TraitContainer {
    private traits: { [key: string]: any } = {};
    trait<T>(type: TraitType<T>): IMaybe<T> {
        var t = <T>this.traits[type.name];
        return Maybe.to(t);
    }
    safeTrait<T>(type: TraitType<T>): T {
        var t = <T>this.traits[type.name];
        if (t == null) {
            throw "Unable to find trait of type " + type.name;
        }
        return t;
    }
    hasTrait<T>(type: TraitType<T>): boolean {
        return this.traits[type.name] != null;
    }
    ensureTrait<T>(type: TraitType<T>, createTrait: () => T): T {
        var t = this.traits[type.name];
        if (t == null) {
            t = createTrait();
            this.traits[type.name] = t;
        }
        return t;
    }
    addTrait<T>(type: TraitType<T>, trait: T): TraitContainer {
        this.traits[type.name] = trait;
        return this;
    }
    removeTraitOfType<T>(type: TraitType<T>): TraitContainer {
        this.traits[type.name] = null;
        return this;
    }
}