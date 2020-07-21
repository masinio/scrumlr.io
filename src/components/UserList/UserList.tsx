import * as React from 'react';
import * as cx from 'classnames';

import { BoardUsers, ModalType, UserInformation } from '../../types';
import Icon, { IconNames } from '../Icon';
import './UserList.scss';
import * as ReactTooltip from 'react-tooltip';
import Avatar from '../Avatar';
import ReadyButton from './ReadyButton';

const reactDDMenu = require('react-dd-menu');
const DropdownMenu = reactDDMenu.DropdownMenu;

export interface UserListProps {
  currentUserId: string;
  users: BoardUsers;
  onToggleReadyState: () => void;
  onOpenModal: (modal: ModalType) => void;
  userDisplayLimit?: number;
  className?: string;
}

export interface UserListState {
  showAllUsers: boolean;
  displayUserInformationDropdown: boolean;
  focusedAvatar: boolean;
}

export class UserList extends React.Component<UserListProps, UserListState> {
  constructor(props: UserListProps) {
    super(props);

    const showAllUsers = this.showAllUsers();
    this.state = {
      showAllUsers,
      displayUserInformationDropdown: false,
      focusedAvatar: false
    };
  }

  updateDimensions = () => {
    const showAllUsers = this.showAllUsers();
    if (showAllUsers !== this.state.showAllUsers) {
      this.setState({ ...this.state, showAllUsers });
    }
  };

  showAllUsers = () => {
    return (
      Boolean(this.props.userDisplayLimit) ||
      (window.innerWidth > 768 &&
        this.props.users &&
        Object.keys(this.props.users).length < (window.innerWidth - 768) / 50)
    );
  };

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  componentDidUpdate(prevProps: Readonly<UserListProps>): void {
    if (
      Object.keys(prevProps.users).length !=
      Object.keys(this.props.users).length
    ) {
      this.updateDimensions();
    }
  }

  renderUserContent(
    user: UserInformation & { id: string },
    isCurrentUser: boolean
  ) {
    const iconName: IconNames = isCurrentUser
      ? 'circle-selection'
      : 'circle-selection-grey';

    const toggleIcon = (
      <div
        className="user-list__other-cursor"
        onClick={() => {
          this.setState({
            ...this.state,
            displayUserInformationDropdown: !this.state
              .displayUserInformationDropdown
          });
        }}
      >
        <Icon
          className="board__user-image-border"
          name={iconName}
          width={44}
          height={44}
          data-tip={user.name}
          data-for={'ALL' + user.id}
        />
        {!isCurrentUser && !this.state.displayUserInformationDropdown && (
          <ReactTooltip
            id={'ALL' + user.id}
            place="bottom"
            effect="solid"
            isCapture={false}
          />
        )}
        <Avatar user={user} className="user-list__avatar" />
        {user.ready && (
          <span className="user-list__ready-state-wrapper">
            <Icon
              name="check"
              aria-hidden="true"
              width={14}
              height={14}
              className="user-list__ready-check-icon"
            />
          </span>
        )}
      </div>
    );

    const ddMenuProps = {
      isOpen: this.state.displayUserInformationDropdown,
      close: () => {
        this.setState({ ...this.state, displayUserInformationDropdown: false });
      },
      toggle: toggleIcon,
      align: 'right',
      closeOnInsideClick: false
    };

    const userPopup = (
      <div className="user-list__other-wrapper">
        <span className="user-list__other-list-name">{user.name}</span>
        <div className="board__user-image-wrapper">
          <Icon
            className="board__user-image-border"
            name={iconName}
            width={44}
            height={44}
            data-tip={user.name}
            data-for={'ALL' + user.id}
          />
          <Avatar user={user} className="user-list__avatar" />
          {user.ready && (
            <span className="user-list__ready-state-wrapper">
              <Icon
                name="check"
                aria-hidden="true"
                width={14}
                height={14}
                className="user-list__ready-check-icon"
              />
            </span>
          )}
        </div>
      </div>
    );

    return (
      <div className="board__user-image-wrapper">
        <DropdownMenu {...ddMenuProps}>{userPopup}</DropdownMenu>
      </div>
    );
  }

  renderUserSummary = () => {
    const onOpenModal = this.props.onOpenModal;

    const tUser = Object.keys(this.props.users).map(key => ({
      ...this.props.users[key],
      id: key
    }));

    const otherUsers = tUser.filter(
      ({ id }) => id !== this.props.currentUserId
    );
    const otherUser = otherUsers[0];

    const readyCount = otherUsers.filter(user => user.ready).length;

    let otherUserNames = tUser.map(({ name }) => name).join(', ');
    if (otherUserNames.length > 64) {
      otherUserNames = otherUserNames.slice(0, 64);
      otherUserNames += '...';
    }

    return (
      <div
        className="board__user-image-wrapper"
        data-tip={otherUserNames}
        data-for="user-list-summary-icon"
      >
        <div
          className="user-list__other-cursor"
          onClick={() => onOpenModal('settings')}
        >
          <Icon
            className="board__user-image-border"
            name="circle-selection-grey"
            width={44}
            height={44}
          />
          <ReactTooltip
            id="user-list-summary-icon"
            place="bottom"
            effect="solid"
          />
          <Avatar user={otherUser} className="user-list__avatar" faded />
          <span className="board__user-count">{otherUsers.length}</span>
          <span className="user-list__ready-state-wrapper">
            <span className="board__user-ready-count">{readyCount}</span>
            <Icon
              name="check"
              aria-hidden="true"
              width={14}
              height={14}
              className="user-list__ready-check-icon"
            />
          </span>
        </div>
      </div>
    );
  };

  render() {
    const { currentUserId, users, onToggleReadyState } = this.props;

    if (!users) {
      return null;
    }

    const tUser = Object.keys(users).map(key => ({
      ...users[key],
      id: key
    }));

    const filteredList = tUser.filter(({ id }) => id !== currentUserId);
    const slicedList = Boolean(this.props.userDisplayLimit)
      ? filteredList.slice(0, this.props.userDisplayLimit)
      : filteredList;

    const currentUser = tUser.find(({ id }) => id === currentUserId);
    if (!currentUser) {
      return <></>;
    }

    return (
      <>
        <ul className={cx('board__user-list', this.props.className)}>
          {!this.state.showAllUsers &&
            tUser.length > 1 &&
            this.renderUserSummary()}

          {this.state.showAllUsers &&
            slicedList.map(userInfo => (
              <li
                key={'ALL' + userInfo.id}
                aria-label={`User ${userInfo.name}`}
              >
                {this.renderUserContent(userInfo, false)}
              </li>
            ))}

          <li key="OWN" aria-label="Yourself">
            {this.renderUserContent(currentUser, true)}
          </li>
        </ul>
        <ReadyButton
          onToggleReadyState={onToggleReadyState}
          ready={currentUser.ready}
        />
      </>
    );
  }
}

export default UserList;
