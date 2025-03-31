import { Input, message, Upload } from 'antd';
import { TextArea, Button, NavBar, Toast } from 'antd-mobile';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Diary.module.less';
import { moodService } from '../services/moodService';

const EMOTIONS = [
  { emoji: '😊', name: '开心', value: 90 },
  { emoji: '😌', name: '放松', value: 75 },
  { emoji: '🤔', name: '思考', value: 60 },
  { emoji: '😢', name: '难过', value: 30 },
  { emoji: '😡', name: '生气', value: 10 }
];

const Diary = () => {
  const [content, setContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<typeof EMOTIONS[0] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(async () => {
    if (!selectedEmotion) {
      Toast.show({
        content: '请选择今日心情',
      });
      return;
    }

    if (!content.trim()) {
      Toast.show({
        content: '请输入日记内容',
      });
      return;
    }

    setSubmitting(true);

    try {
      await moodService.createDiary({
        content: content.trim(),
        emotion: {
          type: selectedEmotion.name,
          intensity: selectedEmotion.value,
          tags: []
        }
      });

      Toast.show({
        icon: 'success',
        content: '保存成功',
      });

      // 保存成功后返回首页
      navigate('/', { replace: true });
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: '保存失败，请重试',
      });
    } finally {
      setSubmitting(false);
    }
  }, [content, selectedEmotion, navigate]);

  return (
    <div className={styles.pageContainer}>
      <NavBar
        className={styles.navbar}
        right={
          <Button
            className={styles.saveButton}
            loading={submitting}
            onClick={handleSubmit}
          >
            保存
          </Button>
        }
        onBack={() => navigate(-1)}
      >
        日记
      </NavBar>

      <div className={styles.content}>
        <div className={styles.inputCard}>
          <TextArea
            placeholder="记录一下今天的心情..."
            value={content}
            onChange={setContent}
            className={styles.textarea}
            rows={6}
            maxLength={500}
            showCount
          />
        </div>

        <div className={styles.emotionSection}>
          <div className={styles.emotionTitle}>今日心情</div>
          <div className={styles.emotionList}>
            {EMOTIONS.map((emotion) => (
              <div
                key={emotion.emoji}
                className={`${styles.emotionItem} ${
                  selectedEmotion?.emoji === emotion.emoji ? styles.selected : ''
                }`}
                onClick={() => setSelectedEmotion(emotion)}
              >
                <span className={styles.emoji}>{emotion.emoji}</span>
                {/* <span className={styles.emotionName}>{emotion.name}</span> */}
              </div>
            ))}
          </div>
        </div>

        {/* <div className={styles.actionButtons}>
          <Button
            className={styles.actionButton}
            shape="rounded"
            color="primary"
            fill="outline"
          >
            🎤 语音输入
          </Button>
          <Button
            className={styles.actionButton}
            shape="rounded"
            color="primary"
            fill="outline"
          >
            🖼️ 添加图片
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default Diary; 