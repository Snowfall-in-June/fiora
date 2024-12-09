import React, { useState } from 'react';
import platform from 'platform';
import { useDispatch } from 'react-redux';

import getFriendId from '@fiora/utils/getFriendId';
import convertMessage from '@fiora/utils/convertMessage';
import Style from './LoginRegister.less';
import Input from '../../components/Input';
import useAction from '../../hooks/useAction';
import {sendVCode, register, getLinkmansLastMessagesV2 } from '../../service';
import { Message } from '../../state/reducer';
import { ActionTypes } from '../../state/action';

/** 登录框 */
function Register() {
    const action = useAction();
    const dispatch = useDispatch();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [vCode, setVCode] = useState('');

    async function handleRegister() {
        const user = await register(
            username,
            password,
            phoneNo,
            vCode,
            platform.os?.family,
            platform.name,
            platform.description,
        );
        if (user) {
            action.setUser(user);
            action.toggleLoginRegisterDialog(false);
            window.localStorage.setItem('token', user.token);

            const linkmanIds = [
                ...user.groups.map((group: any) => group._id),
                ...user.friends.map((friend: any) =>
                    getFriendId(friend.from, friend.to._id),
                ),
            ];
            const linkmanMessages = await getLinkmansLastMessagesV2(linkmanIds);
            Object.values(linkmanMessages).forEach(
                // @ts-ignore
                ({ messages }: { messages: Message[] }) => {
                    messages.forEach(convertMessage);
                },
            );
            dispatch({
                type: ActionTypes.SetLinkmansLastMessages,
                payload: linkmanMessages,
            });
        }
    }

    async function handleSendVCode() {
        await sendVCode(phoneNo);
    }

    return (
        <div className={Style.loginRegister}>
            <h3 className={Style.title}>用户名</h3>
            <Input
                className={Style.input}
                value={username}
                onChange={setUsername}
                onEnter={handleRegister}
            />
            <h3 className={Style.title}>手机号</h3>
            <Input
                className={Style.input}
                type="password"
                value={phoneNo}
                onChange={setPhoneNo}
                onEnter={handleRegister}
            />
            <button
                className={Style.button}
                onClick={handleSendVCode}
                type="button"
            >
                获取短信验证码
            </button>
            <h3 className={Style.title}>短信验证码</h3>
            <Input
                className={Style.input}
                value={vCode}
                onChange={setVCode}
                onEnter={handleRegister}
            />
            <h3 className={Style.title}>密码</h3>
            <Input
                className={Style.input}
                type="password"
                value={password}
                onChange={setPassword}
                onEnter={handleRegister}
            />
            <button
                className={Style.button}
                onClick={handleRegister}
                type="button"
            >
                注册
            </button>
        </div>
    );
}

export default Register;
