import * as types from '~shared/types';

import { CssBaseline, Stack, TextField } from '@mui/material';
import React, { useState } from 'react';
import { StandardHomeButtonLink, StartFlexBox, SubmitButton } from '~client/standard_components/app-components';
import commands, { globalCommands } from '../../commands';

import Head from 'next/head';
import { JoinGroupChannelOutput } from '~client/output';
import { axiosPostWithWebSocket } from '~client/utils/axios';
import { useNotify } from '~client/hooks/useNotify';
import validateJoinGroupChannelCommand from '~client/utils/validations/validate_join_group_channel_command';

/*
  Renders the bos join-group-channel command
  GET call to the NestJs process to get chain deposit address
*/

const JoinGroupChannelCommand = commands.find(n => n.value === 'JoinGroupChannel');

const JoinGroupChannel = () => {
  const [code, setCode] = useState('');
  const [data, setData] = useState(undefined);
  const [maxFeeRate, setMaxFeeRate] = useState('');
  const [node, setNode] = useState('');

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value);
  };

  const handleMaxFeeRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxFeeRate(event.target.value);
  };

  const handleNodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNode(event.target.value);
  };

  const fetchData = async () => {
    try {
      const result = validateJoinGroupChannelCommand({
        code,
        max_rate: Number(maxFeeRate),
      });

      if (!result) {
        return;
      }

      const postBody: types.commandJoinGroupChannel = {
        code,
        node,
        max_rate: Number(maxFeeRate),
        message_id: Date.now().toString(),
      };

      await axiosPostWithWebSocket({
        id: postBody.message_id,
        path: 'join-group-channel',
        postBody,
        setData,
      });
    } catch (error) {
      useNotify({ type: 'error', message: error.message });
    }
  };

  return (
    <CssBaseline>
      <Head>
        <title>Join Group Channel</title>
      </Head>
      <StartFlexBox>
        <StandardHomeButtonLink />
        <Stack spacing={3} style={styles.form}>
          <h2>{JoinGroupChannelCommand.name}</h2>
          <h4 style={styles.h4}>{JoinGroupChannelCommand.description}</h4>
          <h4 style={styles.h4}>{JoinGroupChannelCommand.longDescription}</h4>
          <Instructions />

          <TextField
            type="text"
            placeholder="Invite Code"
            label={JoinGroupChannelCommand.args.code}
            id={JoinGroupChannelCommand.args.code}
            onChange={handleCodeChange}
            style={styles.textField}
          />
          <TextField
            type="text"
            placeholder="Chain fee rate for open"
            label={JoinGroupChannelCommand.flags.max_fee_rate}
            id={JoinGroupChannelCommand.flags.max_fee_rate}
            onChange={handleMaxFeeRateChange}
            style={styles.textField}
          />

          <TextField
            type="text"
            placeholder={globalCommands.node.name}
            label={globalCommands.node.name}
            id={globalCommands.node.value}
            onChange={handleNodeChange}
            style={styles.textField}
          />
          <SubmitButton variant="contained" onClick={fetchData}>
            Run Command
          </SubmitButton>
          <JoinGroupChannelOutput data={data} />
        </Stack>
      </StartFlexBox>
    </CssBaseline>
  );
};

export default JoinGroupChannel;

const styles = {
  form: {
    marginLeft: '50px',
    marginTop: '100px',
    width: '1100px',
  },
  textField: {
    width: '500px',
  },
  h4: {
    marginTop: '0px',
  },
};

const Instructions = () => {
  return (
    <ul>
      <li>
        <b>Important: DO NOT REFRESH THE PAGE WHEN THE COMMAND IS RUNNING.</b>
      </li>
      <li>Code (Required): Invite code to join a group.</li>
      <li>MaxFeeRate (Required): Maximum onchain fee rate you are willing to pay for the channel open.</li>
      <li>The initiator of the group needs to run the Create Group Channel command.</li>
    </ul>
  );
};
