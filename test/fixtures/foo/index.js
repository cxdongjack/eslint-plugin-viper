// 在编辑器里，linter有可能不能自动识别，
// 因此node_module里有eslint, 但是@dk/viper又装在全局
// 看单元测试测试结果就好
helloworld();

{{#a()}}
hello a
{{=b()}}
{{?b}}
b
{{?}}
{{#}}


a();
b();

