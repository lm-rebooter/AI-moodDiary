import { Input, message, Upload } from 'antd';
import { TextArea, Button, NavBar, Toast } from 'antd-mobile';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Diary.module.less';
import { diaryApi } from '../services/api';

const EMOTIONS = [
  { emoji: '😊', name: '开心' },
  { emoji: '😢', name: '难过' },
  { emoji: '😡', name: '生气' },
  { emoji: '😌', name: '放松' },
  { emoji: '🤔', name: '思考' }
];


interface CreateDiaryDTO {
  content: string;
  emotions: { type: string; intensity: number; tags: string[] }[];
}


const Diary = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      // 模拟提交接口
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模拟保存数据到本地存储
      const newDiary = {
        content: content.trim(),
        emotion: selectedEmotion,
        time: new Date().toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: '新增'
      };
      
      localStorage.setItem('latestDiary', JSON.stringify(newDiary));

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


  const handleSave = async () => {
    if (!content.trim()) {
      message.warning('请输入日记内容');
      return;
    }

    try {
      setLoading(true);
      await diaryApi.create({
        content,
        emotions: [{ type: '平静', intensity: 3, tags: [] }]
      });
      message.success('保存成功');
      setContent('');
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

 
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
        back={null}
      >
        写日记
      </NavBar>

      <div className={styles.content}>
        <div className={styles.inputCard}>
          <TextArea
            placeholder="记录一下今天的心情..."
            value={content}
            onChange={setContent}
            className={styles.textarea}
          />
        </div>

        <div className={styles.emotionSection}>
          <div className={styles.emotionTitle}>今日心情</div>
          <div className={styles.emotionList}>
            {EMOTIONS.map((emotion) => (
              <div
                key={emotion.emoji}
                className={`${styles.emotionItem} ${
                  selectedEmotion === emotion.emoji ? styles.selected : ''
                }`}
                onClick={() => setSelectedEmotion(emotion.emoji)}
              >
                <span className={styles.emoji}>{emotion.emoji}</span>
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