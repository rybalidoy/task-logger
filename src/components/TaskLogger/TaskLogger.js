import { Container, Form, Button, Row, Col, Card, Modal } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';

/** Icons */
import deleteIcon from '../../assets/icons/trash.png';
import doneIcon from '../../assets/icons/done.png';
import ongoingIcon from '../../assets/icons/ongoing.png';
import pendingIcon from '../../assets/icons/pending.png';

/** Stylesheet */
import './TaskLogger.css';

function TaskLogger() {
    
    /** You can add types here */
    const taskTypes = [
        'Front-End',
        'Back-End',
        'UX Design'
    ];

    const [tasks,setTasks] = useState(() => {
        const saved = JSON.parse(localStorage.getItem('mytasks'));
        return saved || [];
    });

    const [taskTitle,setTaskTitle] = useState('');
    const [taskType,setTaskType] = useState('');
    const [dateTime,setDateTime] = useState('');
    const [selectedTaskId,setSelectedTaskId] = useState(null);
    const [subtask,setSubtask] = useState({});
    
    /** Local Storage for Task and Subtask */
    useEffect(() => {
        console.log('Saving tasks to local storage:', tasks);
        localStorage.setItem('mytasks', JSON.stringify(tasks));
    }, [tasks]);
    
    useEffect(() => {
        console.log('Updated tasks state:', tasks);
    }, [tasks]);

    

    /** Functions */
    function handleGetDatetime() {
        const now = new Date();
        const options = {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        };
        setDateTime(now.toLocaleString('en-US', options));
    }

    function handleAddTask(event) {
        event.preventDefault();
        handleGetDatetime();
        setTasks((prevTasks) => [
            ...prevTasks,
            {
                id: prevTasks.length,
                title: taskTitle,
                type: taskType,
                subtasks: [],
                lastUpdated: dateTime
            },
        ]);
        console.log('Added new task. Updated tasks state:', tasks);
        setTaskTitle('');
        setTaskType('');
    }

    function handleDeleteTask(taskId) {
        setTasks(tasks.filter((task) => task.id !== taskId));
        console.log('Deleted task. Updated tasks state:', tasks);
    }

    /** Modal */
    function handleSelectTask(id) {
        setSelectedTaskId(id);
        setSubtask('');
    };
    
    function handleCloseModal() {
        setSelectedTaskId(null);
        setSubtask('');
    };
    

    function handleAddSubtask(event) {
        handleGetDatetime();
        if (selectedTaskId !== null) {
            const updatedTasks = [...tasks];
            updatedTasks[selectedTaskId].subtasks.push({
                title: subtask,
                status: 'pending',
            });
            updatedTasks[selectedTaskId].lastUpdated = dateTime;
            setTasks(updatedTasks);
            setSubtask({ title: '', status: ''});
        }
    }	

    function handleSubtaskAction(subtaskIndex, status) {
        if(selectedTaskId !== null) {
            const updatedTasks = [...tasks];
            updatedTasks[selectedTaskId].subtasks[subtaskIndex].status = status;
            setTasks(updatedTasks);
        }
    }

    function calculateTaskProgress(task) {
        if (task.subtasks.length === 0) return 0;
        const totalStatus = task.subtasks.reduce((acc, subtask) => {
            if (subtask.status === 'completed') {
                return acc + 100;
            }
            if (subtask.status === 'ongoing') {
                return acc + 50;
            }
            return acc;
        }, 0);
        return totalStatus / task.subtasks.length;
    };

    return(
        <Container className='p-5 tasklogger-container m-auto mt-5 border'>
            <h2 className='text-center p-3 m-4'> Task Logger</h2>
            <Form>
                <Form.Group className='mb-3' controlId='taskTitle'>
                    <Row>
                        <Col md={3} lg={3}>
                            <Form.Label> Task Title: </Form.Label>
                        </Col>
                        <Col md={9} lg={9}>
                            <Form.Control
                                type='text'
                                name='taskTitle'
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                required
                            />
                        </Col>
                    </Row>
                </Form.Group>
                <Form.Group className='mb-3' controlId='taskType'>
                    <Row>
                        <Col md={3} lg={3}>
                            <Form.Label> Task Type: </Form.Label>
                        </Col>
                        <Col md={7} lg={7}>
                            {taskTypes.map((type) => (
                                <Form.Check 
                                    inline
                                    key={type}
                                    type='radio'
                                    name='taskType'
                                    label={type}
                                    value={type}
                                    checked={taskType === type}
                                    onChange={(e) => setTaskType(e.target.value)}
                                />
                            ))}
                        </Col>
                        <Col md={2} lg={2}>
                            <Button 
                                inline
                                variant='primary' 
                                type='submit' 
                                className='float-end add-button'
                                onClick={handleAddTask}
                            >
                                Add
                            </Button>
                        </Col>
                    </Row>
                </Form.Group>
            </Form>
            <Row>
            {taskTypes.map((type) => (
                <Col lg={6}>
                    <Card 
                        key={type} 
                        className='p-3 task-container' 
                    >
                        <Card.Title className='text-center mb-4'>{type}</Card.Title>
                        {tasks
                        .filter((task) => task.type === type).reverse()
                        .map((task, index) => (
                            <>
                                <Row>
                                    <Col lg={9}>
                                        <Card
                                            key={index} 
                                            className='mb-3 taskCard'
                                            onClick={() => handleSelectTask(task.id)}
                                            style={{
                                                border: '1px solid black',
                                                background: calculateTaskProgress(task) === 100
                                                  ? `linear-gradient(to right, #28a745 ${calculateTaskProgress(task)}%, #fff 0%)`
                                                  : `linear-gradient(to right, orange ${calculateTaskProgress(task)}%, #fff 0%)`,
                                              }}
                                        >
                                            <Card.Body>{task.title}</Card.Body>
                                        </Card> 
                                    </Col>
                                    <Col lg={3} className='p-3'>
                                        <img 
                                            src={deleteIcon} alt='' 
                                            style={{ width: '2em', height: '2em'}}
                                            onClick={() => handleDeleteTask(task.id)}/>
                                    </Col>
                                </Row>
                            </>
                        ))}
                        
                    </Card>
                </Col>
            ))}
            </Row>

            {
                /** Modal View
                 *  For Selected Task
                 */
            }
            {selectedTaskId !== null && (
            <Modal show onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Row>
                        <Modal.Title>{tasks[selectedTaskId].title}</Modal.Title>
                        <p>Last Updated:{tasks[selectedTaskId].lastUpdated}</p>
                    </Row>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        <Col md={8} lg={8}>
                            <Form.Group className='mb-3'>
                                <Form.Control
                                    type='text'
                                    placeholder='Enter subtask title'
                                    value={subtask.title}
                                    onChange={(e) => setSubtask(e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4} lg={4}>
                            <Button 
                                variant='primary' 
                                onClick={handleAddSubtask}  
                                className='float-end'
                                >
                                Add Subtask
                            </Button>
                        </Col>
                    </Row>
                    {[...tasks[selectedTaskId].subtasks].reverse().map((subtask, index) => (
                        <Card 
                            key={index} className='subtaskCard mb-3'
                            style={{ 
                                backgroundColor: subtask.status === 'pending' ? 'lightgrey' : subtask.status === 'ongoing' ? '#fed8b1' : subtask.status === 'completed' ? '#3b8802' : 'white',
                                color: subtask.status === 'completed' ? 'white' : 'black'
                            }}>
                            <Card.Body>
                                <Row className='align-items-center'>
                                    <Col lg={8}>
                                        {subtask.title}
                                    </Col>
                                    <Col lg={4}>
                                        <img 
                                            onClick={() => handleSubtaskAction(tasks[selectedTaskId].subtasks.length - 1 - index,'pending')}
                                            className='subtask-icons' 
                                            src={pendingIcon} alt=''
                                            />
                                        <img 
                                            onClick={() => handleSubtaskAction(tasks[selectedTaskId].subtasks.length - 1 - index,'ongoing')}
                                            className='subtask-icons' 
                                            src={ongoingIcon} alt=''
                                            />
                                        <img 
                                            onClick={() => handleSubtaskAction(tasks[selectedTaskId].subtasks.length - 1 - index,'completed')}
                                            className='subtask-icons' 
                                            src={doneIcon} alt=''
                                            />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ))}
                </Modal.Body>
                </Modal>
            )}

        </Container>
    );
}

export default TaskLogger;