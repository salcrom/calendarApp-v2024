import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { calendarApi } from "../api";
import {
    onAddNewEvent,
    onDeleteEvent,
    onLoadEvents,
    onSetActiveEvents,
    onUpdateEvent,
} from "../store";
import { covertEventsToDateEvents } from "../helpers";

export const useCalendarStore = () => {
    const dispatch = useDispatch();
    const { events, activeEvent } = useSelector((state) => state.calendar);
    const { user } = useSelector((state) => state.auth);

    const setActiveEvent = (calendarEvent) => {
        dispatch(onSetActiveEvents(calendarEvent));
    };

    const startSavingEvent = async (calendarEvent) => {
        try {
            if (calendarEvent.id) {
                // Actualizando
                await calendarApi.put(
                    `/events/${calendarEvent.id}`,
                    calendarEvent
                );
                dispatch(onUpdateEvent({ ...calendarEvent, user }));
                return;
            }

            // Creando
            const { data } = await calendarApi.post("/events", calendarEvent);
            dispatch(
                onAddNewEvent({ ...calendarEvent, id: data.evento.id, user })
            );
        } catch (error) {
            console.log(error);
            Swal.fire("Error al guardar", error.response.data.msg, "error");
        }
    };

    const startDeletingEvent = async () => {
        // Todo: Llegar al backend
        try {
            await calendarApi.delete(`/events/${activeEvent.id}`);
            dispatch(onDeleteEvent());
        } catch (error) {
            console.log(error);
            Swal.fire("Error al eliminar", error.response.data.msg, "error");
        }
    };

    const startLoadingEvents = async () => {
        try {
            const { data } = await calendarApi.get("/events");
            const events = covertEventsToDateEvents(data.eventos);
            dispatch(onLoadEvents(events));
        } catch (error) {
            console.log("Error cargando eventos");
            console.log(error);
        }
    };

    return {
        //* Propiedades
        events,
        activeEvent,
        hasEventSelected: !!activeEvent,

        //* Métodos
        setActiveEvent,
        startDeletingEvent,
        startLoadingEvents,
        startSavingEvent,
    };
};
