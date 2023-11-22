define('myModule', ['assert', 'deepEqual'], function (Assert, Equal) {

  // ...

  return {
    myExportedFunction: TODO1,
    anotherFunction: TODO2
  };
});

define('anotherModule', ['myModule', 'assert'], function (Assert, SomeModule) {
  // ...

  return {};
});

define(['myModule', 'anotherModule'], function (module1, module2) {
  console.log('we loaded the modules!');
  console.log('here is module1: ', module1);
  console.log('here is module2: ', module2);
});

define('assert', ['deepEqual'], function (Equal) { return 'this is the assert module'; });

define('deepEqual', [], function () { return 'this is the deepEqual module'; });
