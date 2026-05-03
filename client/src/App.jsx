import React, { useState, useEffect } from 'react';
import ConsentPage from './pages/Consent';
import PreSurveyPage from './pages/PreSurvey';
import Writing1Page from './pages/Writing1';
import Detecting1Page from './pages/Detecting1';
import Result1Page from './pages/Result1';
import Writing2Page from './pages/Writing2';
import Detecting2Page from './pages/Detecting2';
import Result2Page from './pages/Result2';
import QuestionnairePage from './pages/Questionnaire';
import DonePage from './pages/Done';
import AdminPage from './pages/Admin';
import './index.css';

export default function App() {
  const [state, setState] = useState('CONSENT');
  const [participantId, setParticipantId] = useState(null);
  const [group, setGroup] = useState(null);
  const [draft1Data, setDraft1Data] = useState(null);
  const [draft2Data, setDraft2Data] = useState(null);
  const [draft2SubmitTime, setDraft2SubmitTime] = useState(null);
  const [fakeAIScore1, setFakeAIScore1] = useState(null);
  const [fakeAIScore2, setFakeAIScore2] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/admin')) {
      setState('ADMIN');
    }
  }, []);

  const handleConsentSubmit = (id, groupData) => {
    setParticipantId(id);
    setGroup(groupData);
    setState('PRE_SURVEY');
  };

  const handlePreSurveySubmit = () => {
    setState('WRITING_1');
  };

  const handleWriting1Submit = (data, keystrokeLog) => {
    // draft1 already submitted to backend by Writing1Page
    setDraft1Data({ text: data.text, wordCount: data.wordCount, startTime: data.startTime, keystrokeLog });
    setState('DETECTING_1');
  };

  const handleDetecting1Complete = (score) => {
    setFakeAIScore1(score);
    setState('RESULT_1');
  };

  const handleResult1Continue = () => {
    setState('WRITING_2');
  };

  const handleWriting2Submit = (data, keystrokeLog) => {
    setDraft2Data({ text: data.text, wordCount: data.wordCount, startTime: data.startTime, keystrokeLog });
    setDraft2SubmitTime(new Date().toISOString());
    setState('DETECTING_2');
  };

  const handleDetecting2Complete = (score) => {
    setFakeAIScore2(score);
    setState('RESULT_2');
  };

  const handleResult2Continue = () => {
    setState('QUESTIONNAIRE');
  };

  const handleQuestionnaireSubmit = () => {
    setState('DONE');
  };

  const renderPage = () => {
    switch (state) {
      case 'ADMIN':
        return <AdminPage />;
      case 'CONSENT':
        return <ConsentPage onSubmit={handleConsentSubmit} />;
      case 'PRE_SURVEY':
        return (
          <PreSurveyPage
            participantId={participantId}
            onSubmit={handlePreSurveySubmit}
          />
        );
      case 'WRITING_1':
        return (
          <Writing1Page
            participantId={participantId}
            group={group}
            onSubmit={handleWriting1Submit}
          />
        );
      case 'DETECTING_1':
        return <Detecting1Page onComplete={handleDetecting1Complete} />;
      case 'RESULT_1':
        return (
          <Result1Page
            group={group}
            fakeAIScore={fakeAIScore1}
            onContinue={handleResult1Continue}
          />
        );
      case 'WRITING_2':
        return (
          <Writing2Page
            participantId={participantId}
            group={group}
            initialText={draft1Data?.text}
            onSubmit={handleWriting2Submit}
          />
        );
      case 'DETECTING_2':
        return <Detecting2Page onComplete={handleDetecting2Complete} />;
      case 'RESULT_2':
        return (
          <Result2Page
            group={group}
            fakeAIScore2={fakeAIScore2}
            onContinue={handleResult2Continue}
          />
        );
      case 'QUESTIONNAIRE':
        return (
          <QuestionnairePage
            participantId={participantId}
            group={group}
            draft1Data={draft1Data}
            draft2Data={draft2Data}
            draft2SubmitTime={draft2SubmitTime}
            fakeAIScore1={fakeAIScore1}
            fakeAIScore2={fakeAIScore2}
            onSubmit={handleQuestionnaireSubmit}
          />
        );
      case 'DONE':
        return <DonePage />;
      default:
        return <ConsentPage onSubmit={handleConsentSubmit} />;
    }
  };

  return <div className="min-h-screen">{renderPage()}</div>;
}
