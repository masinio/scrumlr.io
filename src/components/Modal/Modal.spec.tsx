import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { DispatchModalProps, Modal, OwnModalProps } from './Modal';

describe('<Modal />', () => {
  describe('dumb component', () => {
    let props: OwnModalProps & DispatchModalProps;
    let shallowWrapper: ShallowWrapper<OwnModalProps & DispatchModalProps, {}>;

    beforeEach(() => {
      props = {
        onClose: jest.fn(),
        onSubmit: jest.fn(),
        onStatus: jest.fn(),
        children: 'Test'
      };

      shallowWrapper = shallow(<Modal {...props} />);
    });

    describe('rendering', () => {
      it('should match the snapshot', () => {
        // FIXME use .html() when svg inline loader issues are fixed
        // expect(shallowWrapper.html()).toMatchSnapshot();
        expect(shallowWrapper.text()).toMatchSnapshot();
      });

      it('should call onStatus on mount', () => {
        expect(props.onStatus).toHaveBeenCalled();
      });

      it('should call onClose on click on close icon', () => {
        expect(props.onClose).not.toHaveBeenCalled();
        shallowWrapper.find('.modal__close-button').simulate('click');
        expect(props.onClose).toHaveBeenCalled();
      });

      it('should call onSubmit on click on OK button', () => {
        expect(props.onSubmit).not.toHaveBeenCalled();
        shallowWrapper.find('.modal__ack-button').simulate('click');
        expect(props.onSubmit).toHaveBeenCalled();
      });
    });
  });
});
