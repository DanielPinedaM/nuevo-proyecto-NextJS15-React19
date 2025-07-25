'use client';
import { GrView } from 'react-icons/gr';

export default function ListData({ post }) {
  const { id, userId, title, completed } = post;

  const onClickViewAlert = (userId: number): void => {
    alert(userId);
  };

  return (
    <>
      <p>
        <span className='font-bold'>id</span> <span>{id}</span>
      </p>
      <p>
        <span className='font-bold'>title</span> <span>{title}</span>
      </p>
      <p>
        <span className='font-bold'>completed</span> <span>{completed ? 'si' : 'no'}</span>
      </p>

      <button
        className='button-icon-and-text'
        onClick={() => onClickViewAlert(userId)}
      >
        <GrView />
        <span>ver userId</span>
      </button>

      <br />
      <br />
    </>
  );
}
