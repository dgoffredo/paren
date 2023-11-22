function define(name, deps, create) {
  define.modules[name] = create();
}

define.modules = {};
