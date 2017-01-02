// <!-- Created by Duncan on 12.28.2016 -->
import Vue from 'vue';
import MainContent from '../../client/vue-components/main_content.vue';
// Using this package for socket, not sure what will be needed for Go
import VueSocketio from 'vue-socket.io'
// Websocket connection using vue-socket.io using temp_socket server
Vue.use(VueSocketio, 'http://localhost:3000');

describe('MainContent', () => {

  // Inspect the raw component options
  it('has a created hook', () => {
    expect(typeof MainContent.created).toBe('function');
  });

  // Evaluate the results of functions in
  // the raw component options
  it('sets the correct default data', () => {
    expect(typeof MainContent.created).toBe('function');
    const defaultData = MainContent.data();
    expect(defaultData.count).toBe(0);
    expect(defaultData.input).toBe('Markdown for text editor, works try it out!');
  });

  // Inspect the component instance on mount
  it('correctly sets the message when created', () => {
    const vm = new Vue(MainContent).$mount();
    expect(vm.input).toBe('Markdown for text editor, works try it out!');
  });

  // Mount an instance and inspect the render output
  it('should update input and increase count', () => {
    const Ctor = Vue.extend(MainContent);
    const vm = new Ctor().$mount();
    vm.update({target:{value: 'Markdown for text editor, works try it out! Plus this!'}});
    vm.wordCounter();
    expect(vm.$data.input).toBe('Markdown for text editor, works try it out! Plus this!');
    expect(vm.$data.count).toBe(10);
  })
});

